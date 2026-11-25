import cv2, numpy as np, glob, json, sys
fs=sorted(glob.glob(sys.argv[1]+'/*.png')); R=int(sys.argv[2])
G=[cv2.cvtColor(cv2.imread(f),cv2.COLOR_BGR2GRAY) for f in fs]
roi=np.array([(470,80),(600,100),(830,470),(800,560),(620,560),(560,420),(470,250)],np.int32)
mask=np.zeros_like(G[R]);cv2.fillPoly(mask,[roi],255)
def detect(g,m):
    p=cv2.goodFeaturesToTrack(g,400,0.005,6,mask=m,blockSize=7);return p.reshape(-1,2) if p is not None else np.zeros((0,2),np.float32)
H=[None]*len(G);H[R]=np.eye(3)
lk=dict(winSize=(25,25),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,40,0.01))
for step in (1,-1):
    refp=detect(G[R],mask);cur=refp.copy();k=R
    while 0<=k+step<len(G):
        n=k+step
        nxt,st,_=cv2.calcOpticalFlowPyrLK(G[k],G[n],cur.astype(np.float32),None,**lk)
        back,st2,_=cv2.calcOpticalFlowPyrLK(G[n],G[k],nxt,None,**lk)
        ok=(st.ravel()==1)&(st2.ravel()==1)&(np.linalg.norm(back-cur,axis=1)<1.0)
        refp,cur=refp[ok],nxt[ok]
        Hn,inl=cv2.findHomography(refp,cur,cv2.RANSAC,2.0)
        H[n]=Hn; inl=inl.ravel()==1; refp,cur=refp[inl],cur[inl]
        if len(cur)<120:  # re-detect in frame n, map to ref
            m=np.zeros_like(G[n]);cv2.fillPoly(m,[cv2.perspectiveTransform(roi.reshape(-1,1,2).astype(np.float32),Hn).astype(np.int32)],255)
            newc=detect(G[n],m);newr=cv2.perspectiveTransform(newc.reshape(-1,1,2),np.linalg.inv(Hn)).reshape(-1,2)
            cur=np.vstack([cur,newc]);refp=np.vstack([refp,newr])
        k=n
        print(n,len(cur),file=sys.stderr)
json.dump([h.tolist() for h in H],open(sys.argv[3],'w'))
