import cv2,numpy as np,sys,os
S=sys.argv[1];c=np.load(S+'/centers.npy');n=len(c)
xs=np.convolve(np.pad(c[:,0],(6,6),mode='edge'),np.ones(13)/13,mode='valid')
os.makedirs(S+'/w3c',exist_ok=True)
for k in range(n):
    z=1.45+0.12*(k/(n-1))            # slow push-in
    w,h=1920/z,1080/z
    cx=np.clip(xs[k]+40,w/2,1920-w/2);cy=np.clip(c[k,1]+170,h/2,1080-h/2)
    fr=cv2.imread(f'{S}/w3o/{k:03d}.png')
    M=np.array([[z,0,960-z*cx],[0,z,540-z*cy]],np.float32)
    cv2.imwrite(f'{S}/w3c/{k:03d}.png',cv2.warpAffine(fr,M,(1920,1080),flags=cv2.INTER_LANCZOS4))
