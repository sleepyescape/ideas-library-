import cv2, numpy as np, json, sys, math
from PIL import Image, ImageDraw
S,P=sys.argv[1],sys.argv[2]
H=[np.array(h) for h in json.load(open(S+'/H.json'))]
W,Hh=1280,720; K=2
d=np.array([0.447,0.894]);d/=np.linalg.norm(d);n=np.array([-d[1],d[0]])  # inward normal (left/down)
edge=lambda y:np.array([640+(y-160)*0.5,y])
# --- decal canvas (ref coords x2)
dec=Image.new('RGBA',(W*K,Hh*K),(0,0,0,0))
# yellow cheat-line along fuselage
a0,a1=edge(150)+n*52,edge(470)+n*52;b0,b1=a0+n*9,a1+n*9
ImageDraw.Draw(dec).polygon([tuple(p*K) for p in (a0,a1,b1,b0)],fill=(255,194,26,255))
a0,a1=edge(150)+n*64,edge(470)+n*64;b0,b1=a0+n*3,a1+n*3
ImageDraw.Draw(dec).polygon([tuple(p*K) for p in (a0,a1,b1,b0)],fill=(26,26,26,255))
# wordmark
wm=Image.open(P+'/wordmark.png').convert('RGBA');h=31*K;wm=wm.resize((int(wm.width*h/wm.height),h),Image.LANCZOS)
ang=math.degrees(math.atan2(d[1],d[0]));wr=wm.rotate(-ang,expand=True,resample=Image.BICUBIC)
c=(edge(296)+n*24)*K;dec.alpha_composite(wr,(int(c[0]-wr.width/2),int(c[1]-wr.height/2)))
decA=np.asarray(dec).astype(np.float32)/255
# inpaint mask (old "Airlines" + faint text), ref coords
m0=[edge(165)+n*1.5,edge(365)+n*1.5,edge(365)+n*48,edge(165)+n*48]
SC=np.diag([1/K,1/K,1])
for k in range(len(H)):
    fr=cv2.imread(f'{S}/pf/{k+1:03d}.png')
    mk=np.zeros((Hh,W),np.uint8);pts=cv2.perspectiveTransform(np.array(m0,np.float32).reshape(-1,1,2),H[k]).astype(np.int32);cv2.fillPoly(mk,[pts],255)
    base=cv2.inpaint(fr,mk,6,cv2.INPAINT_TELEA)
    # smooth inpainted area to look like painted metal
    bl=cv2.GaussianBlur(base,(0,0),3);mkf=cv2.GaussianBlur(mk,(0,0),2)[...,None]/255.0
    base=(base*(1-mkf)+bl*mkf)
    wd=cv2.warpPerspective(decA,H[k]@SC,(W,Hh),flags=cv2.INTER_AREA if False else cv2.INTER_LINEAR)
    wd=cv2.GaussianBlur(wd,(0,0),0.55)
    al=wd[...,3:4];rgb=wd[...,[2,1,0]]*255
    gray=cv2.cvtColor(base.astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)
    shade=np.clip(cv2.GaussianBlur(gray,(0,0),2)/212.0,0.55,1.12)[...,None]
    lit=rgb*shade
    out=base*(1-al*0.96)+lit*al*0.96
    out+=np.random.normal(0,2.2,out.shape)*al
    cv2.imwrite(f'{S}/out/{k:03d}.png',np.clip(out,0,255).astype(np.uint8))
print('done')
