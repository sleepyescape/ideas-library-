import cv2, numpy as np, glob, sys, os
S=sys.argv[1]
fs=sorted(glob.glob(S+'/w3/*.png'))[:72];frames=[cv2.imread(f) for f in fs];G=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
R=39
lk=dict(winSize=(31,31),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,40,0.01))
# features on the watch case, strap and the wrist above it (thumb excluded)
roi=np.array([(780,140),(830,40),(990,0),(1400,0),(1400,90),(1080,150),(990,40),(835,125),(820,250),(870,330),(780,330)],np.int32)
m=np.zeros_like(G[R]);cv2.fillPoly(m,[roi],255)
def run(step):
    ref=cv2.goodFeaturesToTrack(G[R],500,0.004,6,mask=m).reshape(-1,2);cur=ref.copy();k=R;out={}
    while 0<=k+step<len(G):
        n=k+step
        nx,st,_=cv2.calcOpticalFlowPyrLK(G[k],G[n],cur.astype(np.float32),None,**lk)
        bk,st2,_=cv2.calcOpticalFlowPyrLK(G[n],G[k],nx,None,**lk)
        ok=(st.ravel()==1)&(st2.ravel()==1)&(np.linalg.norm(bk-cur,axis=1)<1.0)
        ref,cur=ref[ok],nx[ok]
        h,inl=cv2.findHomography(ref,cur,cv2.RANSAC,1.5);inl=inl.ravel()==1;ref,cur=ref[inl],cur[inl];out[n]=h;k=n
    return out
H={R:np.eye(3)};H.update(run(1));H.update(run(-1))
glass=np.array([(834,127),(980,47),(1101,255),(955,335)],np.float32)
c=glass.mean(0);quad=c+(glass-c)*0.955  # active display inside the black border
UW,UH=800,1160
mk=np.zeros((UH,UW),np.uint8);r=150
cv2.rectangle(mk,(r,0),(UW-r,UH),255,-1);cv2.rectangle(mk,(0,r),(UW,UH-r),255,-1)
for cx,cy in [(r,r),(UW-r,r),(r,UH-r),(UW-r,UH-r)]: cv2.circle(mk,(cx,cy),r,255,-1)
mk=mk.astype(np.float32)/255
src=np.array([(0,0),(UW,0),(UW,UH),(0,UH)],np.float32)
os.makedirs(S+'/w3o',exist_ok=True);centers=[]
for k,fr in enumerate(frames):
    ui=cv2.imread(f'{S}/ui2f/{k:03d}.png',cv2.IMREAD_UNCHANGED).astype(np.float32)
    rgb=ui[...,:3];a=ui[...,3]/255*mk
    dst=cv2.perspectiveTransform(quad.reshape(-1,1,2),H[k]).reshape(-1,2).astype(np.float32);centers.append(dst.mean(0))
    M=cv2.getPerspectiveTransform(src,dst)
    wr=cv2.warpPerspective(rgb,M,(1920,1080),flags=cv2.INTER_AREA);wa=cv2.warpPerspective(a,M,(1920,1080))
    # occlusion: keep the thumb/nail (skin tones) in front of the display
    ycc=cv2.cvtColor(fr,cv2.COLOR_BGR2YCrCb).astype(np.float32);Y,Cr,Cb=ycc[...,0],ycc[...,1],ycc[...,2]
    skin=((Cr>138)&(Cb<132)&(Y>70))|((Y>175)&(Cr>133))
    skin=cv2.morphologyEx(skin.astype(np.uint8)*255,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    skin=cv2.dilate(skin,np.ones((3,3),np.uint8));skin=cv2.GaussianBlur(skin.astype(np.float32),(0,0),1.2)/255
    wa=cv2.GaussianBlur(wa,(0,0),0.9)*(1-skin)
    wr=cv2.GaussianBlur(wr,(0,0),0.6)
    orig=fr.astype(np.float32)
    refl=np.clip(cv2.GaussianBlur(orig,(0,0),10)-30,0,255)*0.10   # glass reflections
    out=orig*(1-wa[...,None])+(wr*0.95+refl)*wa[...,None]
    cv2.imwrite(f'{S}/w3o/{k:03d}.png',np.clip(out,0,255).astype(np.uint8))
np.save(S+'/centers.npy',np.array(centers))
print('done')
