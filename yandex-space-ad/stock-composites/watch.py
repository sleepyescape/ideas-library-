import cv2, numpy as np, glob, sys, os
S=sys.argv[1]
fs=sorted(glob.glob(S+'/wf/*.png'))[:72];frames=[cv2.imread(f) for f in fs];G=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
lk=dict(winSize=(31,31),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
roi=np.array([(30,380),(1060,380),(1060,1680),(30,1680)],np.int32);m=np.zeros_like(G[0]);cv2.fillPoly(m,[roi],255)
ref=cv2.goodFeaturesToTrack(G[0],500,0.005,8,mask=m).reshape(-1,2);cur=ref.copy();H=[np.eye(3)]
for k in range(1,len(G)):
    nx,st,_=cv2.calcOpticalFlowPyrLK(G[k-1],G[k],cur.astype(np.float32),None,**lk)
    ok=st.ravel()==1;ref,cur=ref[ok],nx[ok]
    h,inl=cv2.findHomography(ref,cur,cv2.RANSAC,2.0);inl=inl.ravel()==1;ref,cur=ref[inl],cur[inl];H.append(h)
print('pts',len(cur))
quad=np.array([(118,498),(910,490),(892,1532),(108,1548)],np.float32)
UW,UH=800,1060
# rounded-rect mask for the display
mk=np.zeros((UH,UW),np.uint8);r=110
cv2.rectangle(mk,(r,0),(UW-r,UH),255,-1);cv2.rectangle(mk,(0,r),(UW,UH-r),255,-1)
for cx,cy in [(r,r),(UW-r,r),(r,UH-r),(UW-r,UH-r)]: cv2.circle(mk,(cx,cy),r,255,-1)
mk=mk.astype(np.float32)/255
os.makedirs(S+'/wo',exist_ok=True)
src=np.array([(0,0),(UW,0),(UW,UH),(0,UH)],np.float32)
for k,fr in enumerate(frames):
    ui=cv2.imread(f'{S}/ui/{k:03d}.png',cv2.IMREAD_UNCHANGED).astype(np.float32)
    rgb=ui[...,:3];a=ui[...,3]/255*mk
    dst=cv2.perspectiveTransform(quad.reshape(-1,1,2),H[k]).reshape(-1,2).astype(np.float32)
    M=cv2.getPerspectiveTransform(src,dst)
    wr=cv2.warpPerspective(rgb,M,(1080,1920),flags=cv2.INTER_AREA);wa=cv2.warpPerspective(a,M,(1080,1920))
    # match softness of the footage (shallow depth of field, display under glass)
    wr=cv2.GaussianBlur(wr,(0,0),1.1);wa=cv2.GaussianBlur(wa,(0,0),1.3)[...,None]
    orig=fr.astype(np.float32)
    glass=cv2.GaussianBlur(orig,(0,0),14)
    # keep glass reflections: lighten with a bit of the original's low frequencies where it's bright
    emis=wr*0.94+np.clip(glass-40,0,255)*0.10
    out=orig*(1-wa)+emis*wa
    cv2.imwrite(f'{S}/wo/{k:03d}.png',np.clip(out,0,255).astype(np.uint8))
print('done',len(frames))
