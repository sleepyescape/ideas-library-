import cv2, numpy as np, os
os.makedirs('endseq',exist_ok=True)
W,H=1920,1080
cl=lambda x,a=0,b=1:min(b,max(a,x))
ss=lambda x:(lambda y:y*y*(3-2*y))(cl(x))
eio=lambda x:(lambda y:4*y**3 if y<.5 else 1-(-2*y+2)**3/2)(cl(x))
# camera keyframes: t, zoom, cx, cy
K=[(0,1.0,960,540),(0.55,1.45,640,430),(2.3,1.45,640,430),(2.95,1.3,740,520),(3.35,1.3,740,520),(4.3,1.85,330,560),(5.0,1.9,320,700),(6.65,2.0,320,730)]
def cam(t):
    for (t0,z0,x0,y0),(t1,z1,x1,y1) in zip(K,K[1:]):
        if t<=t1:
            e=eio((t-t0)/(t1-t0)) if t1>t0 else 1
            return z0+(z1-z0)*e,x0+(x1-x0)*e,y0+(y1-y0)*e
    return K[-1][1:]
def view(img,t):
    z,cx,cy=cam(t);w,h=W/z,H/z
    cx=min(max(cx,w/2),W-w/2);cy=min(max(cy,h/2),H-h/2)
    M=np.array([[z,0,W/2-z*cx],[0,z,H/2-z*cy]],np.float32)
    return cv2.warpAffine(img,M,(W,H),flags=cv2.INTER_LANCZOS4)
n=0
# 1) girl with banner: 146 frames
for k in range(146):
    g=cv2.imread(f'gf2/{k:04d}.jpg').astype(np.float32)
    ov=cv2.imread(f'gov/{k:04d}.png',cv2.IMREAD_UNCHANGED).astype(np.float32);a=ov[...,3:]/255
    cv2.imwrite(f'endseq/{n:04d}.jpg',(g*(1-a)+ov[...,:3]*a).astype(np.uint8));n+=1
lastban=cv2.imread('gov/0145.png',cv2.IMREAD_UNCHANGED).astype(np.float32)
# 2) app demo: 398 frames, first 0.6 s expand from the banner
for k in range(398):
    t=k/60;app=view(cv2.imread(f'appcap/{k:04d}.jpg'),t).astype(np.float32)
    e=eio(t/0.6)
    if e<1:
        gi=min(146+k,len(os.listdir('gf2'))-1);bg=cv2.imread(f'gf2/{gi:04d}.jpg').astype(np.float32)
        x0,y0,x1,y1=580,44,1340,194
        X0=int(x0*(1-e));Y0=int(y0*(1-e));X1=int(x1+(W-x1)*e);Y1=int(y1+(H-y1)*e);R=int(44*(1-e))
        small=cv2.resize(app,(max(2,X1-X0),max(2,Y1-Y0)),interpolation=cv2.INTER_AREA)
        m=np.zeros((Y1-Y0,X1-X0),np.uint8);cv2.rectangle(m,(R,0),(X1-X0-R,Y1-Y0),255,-1);cv2.rectangle(m,(0,R),(X1-X0,Y1-Y0-R),255,-1)
        for cx,cy in [(R,R),(X1-X0-R-1,R),(R,Y1-Y0-R-1),(X1-X0-R-1,Y1-Y0-R-1)]: cv2.circle(m,(cx,cy),R,255,-1)
        m=cv2.GaussianBlur(m.astype(np.float32),(0,0),1)[...,None]/255
        out=bg.copy();reg=out[Y0:Y1,X0:X1];out[Y0:Y1,X0:X1]=reg*(1-m)+small*m
        # banner fades out on top
        ba=lastban[...,3:]/255*(1-ss(t/0.3));out=out*(1-ba)+lastban[...,:3]*ba
        app=out
    cv2.imwrite(f'endseq/{n:04d}.jpg',app.astype(np.uint8));n+=1
# 3) logo end: 80 frames (cut on beat with white flash)
for k in range(80):
    im=cv2.imread(f'logoend/{k:04d}.jpg').astype(np.float32)
    if k>70: im*=1-(k-70)/10
    cv2.imwrite(f'endseq/{n:04d}.jpg',im.astype(np.uint8));n+=1
print(n)
