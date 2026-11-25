import cv2, numpy as np, glob, sys
S,C=sys.argv[1],sys.argv[2]
fs=sorted(glob.glob(S+'/cm/*.png'))[:72]
frames=[cv2.imread(f) for f in fs];G=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
lk=dict(winSize=(31,31),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
roi=np.array([(1480,640),(1920,640),(1920,1060),(1480,1060)],np.int32)
m=np.zeros_like(G[0]);cv2.fillPoly(m,[roi],255)
ref=cv2.goodFeaturesToTrack(G[0],400,0.005,6,mask=m).reshape(-1,2);cur=ref.copy();H=[np.eye(3)]
for k in range(1,len(G)):
    nx,st,_=cv2.calcOpticalFlowPyrLK(G[k-1],G[k],cur.astype(np.float32),None,**lk)
    ok=st.ravel()==1;ref,cur=ref[ok],nx[ok]
    h,inl=cv2.findHomography(ref,cur,cv2.RANSAC,2.0);inl=inl.ravel()==1;ref,cur=ref[inl],cur[inl];H.append(h)
print('pts',len(cur))
cap=cv2.VideoCapture(C+'/screen-3s.mp4');app=[]
while True:
    ok,f=cap.read()
    if not ok:break
    app.append(f)
quad=np.array([(1676,736),(2012,760),(2012,938),(1671,904)],np.float32)
W,Hh=1920,1080
import os;os.makedirs(S+'/cm_out',exist_ok=True)
for k,fr in enumerate(frames):
    a=app[min(int(k/23.976*30),len(app)-1)]
    ah,aw=a.shape[:2];src=np.array([(0,0),(aw,0),(aw,ah),(0,ah)],np.float32)
    dst=cv2.perspectiveTransform(quad.reshape(-1,1,2),H[k]).reshape(-1,2).astype(np.float32)
    M=cv2.getPerspectiveTransform(src,dst)
    wa=cv2.warpPerspective(a,M,(W,Hh),flags=cv2.INTER_AREA).astype(np.float32)
    al=cv2.warpPerspective(np.ones((ah,aw),np.float32),M,(W,Hh))
    # emissive display, slightly out of focus like the original
    wa=cv2.GaussianBlur(wa,(0,0),1.6);al=cv2.GaussianBlur(al,(0,0),2.0)[...,None]
    wa=wa*0.78+6; wa[...,0]=wa[...,0]*1.06; wa[...,2]=wa[...,2]*0.97
    orig=fr.astype(np.float32)
    refl=cv2.GaussianBlur(orig,(0,0),6)  # keep reflections of the glass
    out=orig*(1-al)+(wa*0.88+refl*0.12)*al
    # soft glow of the screen on nearby plastic
    glow=cv2.GaussianBlur(wa*al,(0,0),18)*0.10
    out=out+glow
    # slow push-in toward the screen
    z=1.0+0.18*(k/(len(frames)-1))**1.3
    cx,cy=W/2+(1700-W/2)*0.35*(z-1)/0.18,H_c if False else Hh/2+(820-Hh/2)*0.35*(z-1)/0.18
    T=np.array([[z,0,cx-z*cx],[0,z,cy-z*cy]],np.float32)
    out=cv2.warpAffine(np.clip(out,0,255).astype(np.uint8),T,(W,Hh),flags=cv2.INTER_LANCZOS4)
    cv2.imwrite(f'{S}/cm_out/{k:03d}.png',out)
print('frames',len(frames))
