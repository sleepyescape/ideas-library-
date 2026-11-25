import sys, re, json, numpy as np, potrace
from PIL import Image, ImageFilter
src,out=sys.argv[1],sys.argv[2]; K=4
im=Image.open(src).convert('RGBA'); W=im.width*K
a=np.asarray(im).astype(float); R,G,B,A=[a[...,i] for i in range(4)]
cl=lambda x:np.clip(x,0,1)
L=(R+G+B)/3
white=cl((np.minimum(np.minimum(R,G),B)-90)/(235-90))          # all channels high
yel=cl((R-B-60)/(215-60))                                        # warm & saturated
beam=cl(yel+white*0)                                             # beam visible part
hi=cl((G-200)/(214-200))*cl((B-60)/(105-60))*(1-white)            # lighter yellow: higher G and B, not white
circ=A/255
er=np.asarray(Image.fromarray(A.astype(np.uint8)).filter(ImageFilter.MinFilter(9))).astype(float)/255
white=white*er
def up(m,s=0.7):
    i=Image.fromarray((cl(m)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(s)).resize((W,W),Image.BICUBIC)
    return np.asarray(i)>127
def path(m,keep=1):
    pl=potrace.Bitmap(~m).trace(turdsize=200,alphamax=1.15,opticurve=True,opttolerance=0.5)
    s=[];f=lambda p:f"{p.x/K:.2f} {p.y/K:.2f}"
    for c in pl:
        sub=['M'+f(c.start_point)]
        for seg in c.segments:
            sub.append(('L'+f(seg.c)+' L'+f(seg.end_point)) if seg.is_corner else ('C'+f(seg.c1)+' '+f(seg.c2)+' '+f(seg.end_point)))
        sub.append('Z'); sp=''.join(sub)
        n=[float(x) for x in re.findall(r'-?\d+\.?\d*',sp)];xs=n[0::2];ys=n[1::2]
        w=max(xs)-min(xs);h=max(ys)-min(ys)
        if w>20 and h>20 and w*h>5000: s.append((w*h,sp))
    s.sort(reverse=True)
    return ''.join(x[1] for x in s[:keep])
res={'circle':path(up(circ)),'beam':path(up(beam)),'hi':path(up(hi)),'fur':path(up(white),3)}
json.dump(res,open(out,'w')); print({k:v.count('M') for k,v in res.items()})
