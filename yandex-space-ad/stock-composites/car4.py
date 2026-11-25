import cv2, numpy as np, glob, sys
S,C=sys.argv[1],sys.argv[2]
lk=dict(winSize=(21,21),maxLevel=3,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,30,0.01))
def track(frames,roi):
    G=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
    m=np.zeros_like(G[0]);cv2.fillPoly(m,[np.array(roi,np.int32)],255)
    ref=cv2.goodFeaturesToTrack(G[0],300,0.01,5,mask=m).reshape(-1,2);cur=ref.copy();H=[np.eye(3)]
    for k in range(1,len(G)):
        nx,st,_=cv2.calcOpticalFlowPyrLK(G[k-1],G[k],cur.astype(np.float32),None,**lk)
        ok=st.ravel()==1;ref,cur=ref[ok],nx[ok]
        h,inl=cv2.findHomography(ref,cur,cv2.RANSAC,1.5);inl=inl.ravel()==1;ref,cur=ref[inl],cur[inl];H.append(h)
    return H
cap=cv2.VideoCapture(C+'/screen-4s.mp4');app=[]
while True:
    ok,f=cap.read()
    if not ok:break
    app.append(f)
def fitcover(img,ar):
    h,w=img.shape[:2]
    if w/h>ar: nw=int(h*ar);x=min(8,w-nw);return img[:,x:x+nw]
    nh=int(w/ar);y=(h-nh)//2;return img[y:y+nh]
shots=[('ca',48,[(990,120),(1163,117),(1163,220),(991,220)],[(960,95),(1195,95),(1195,245),(960,245)]),
       ('cb',72,[(284,153),(931,151),(934,550),(288,548)],[(205,95),(1035,95),(1035,640),(205,640)])]
gi=0
for name,nf,quad,roi in shots:
    frames=[cv2.imread(f) for f in sorted(glob.glob(f'{S}/{name}/*.png'))[:nf]]
    H=track(frames,roi);q=np.array(quad,np.float32)
    w=np.linalg.norm(q[1]-q[0]);h=np.linalg.norm(q[3]-q[0])
    for k,fr in enumerate(frames):
        a=fitcover(app[min(gi,len(app)-1)],w/h)
        a=cv2.resize(a,(1280,int(1280*a.shape[0]/a.shape[1])),interpolation=cv2.INTER_AREA)
        ah,aw=a.shape[:2];src=np.array([(0,0),(aw,0),(aw,ah),(0,ah)],np.float32)
        dst=cv2.perspectiveTransform(q.reshape(-1,1,2),H[k]).reshape(-1,2)
        M=cv2.getPerspectiveTransform(src,dst.astype(np.float32))
        wa=cv2.warpPerspective(a,M,(fr.shape[1],fr.shape[0]),flags=cv2.INTER_AREA).astype(np.float32)
        al=cv2.warpPerspective(np.ones((ah,aw),np.float32),M,(fr.shape[1],fr.shape[0]))
        al=cv2.GaussianBlur(al,(0,0),0.6)[...,None]
        # screen look: slightly lower contrast, cool tint, glare gradient from original screen luminance
        wa=wa*0.93+12; wa[...,0]*=1.03
        orig=fr.astype(np.float32);glare=cv2.GaussianBlur(orig,(0,0),25)
        wa=wa*0.9+glare*0.10
        if name=='ca': wa=cv2.GaussianBlur(wa,(0,0),0.7)
        out=orig*(1-al)+wa*al
        cv2.imwrite(f'{S}/carout/{gi:03d}.png',np.clip(out,0,255).astype(np.uint8));gi+=1
print('frames',gi)
