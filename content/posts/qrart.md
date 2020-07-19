---
title: "Drawing on QR Codes"
date: 2020-05-25T18:46:13+03:00
ogimage: "/images/qrchest.png"
tags: [
"python",
"barcodes"
]
description2: "Influencing QR code generation to produce art"
---
We've all seen fancy QR codes with images.
Usually, they have a small logo or something in the center.
They are very easy to make, and to be honest not very impressive.
Just generate your QR and put some image on top, that's all.  
That works because all QRs have some amount of data reserved for error correction.
You can flip some bits, obscure parts of the code, or use a noisy camera and it would still be readable.

But have you ever wanted to **REALLY** embed an image into QR code?
Not just slap something on top, but force the code to be generated with an image embedded in it.  
Something like this:

<div align="center">
<figure width="100%" align="center">
<img src="/images/qrchest.png" width="100%">
<figcaption align="center"> This is perfectly valid and readable QR code. It contains a link to this very article. </figcaption>
</figure>
</div>

Yep, this is possible, though not as easy.
I, as a [hacker](https://en.wikipedia.org/wiki/Hacker_culture), was completely fascinated when I first saw something like this.
I just had to understand how this works.
Through some experimentation and reading QR specs, I finally figured it out.
My method is not perfect, or incredibly fast, but it works.
If you want to make it faster, then wish you luck reading the specs.
For me brute force was good enough.

### So how it works?

Basically, squares of the QR code represent bits of the data you put in.
So, by putting in different characters, you can influence the resulting pattern.
We just need to find the right data to put in.
And somehow make it not interfere with the message that we want to encode.
For links this is fairly easy.  

All URLs can contain anchors.
This is stuff after the '#' character.
Basically what it does, is telling the browser that string after it is an id.
The browser would scroll to element with this id after loading the page.
If there is no such element, the anchor is just ignored.
So we can put anything after it, and the link would remain clickable.

For example:
`https://techadv.xyz#0006011024100006063346000006002046160006030305000001024701000000...`

Looks promising. 
So we can put in any amount of random data, now we just need to find the correct one. 
Here are things that you should keep in mind to be able to perform such a trick.
Also, I will provide an example code in the end.

## Encoding mode

The first thing that comes in mind is to just try every possible combination of characters.
This approach is so slow that you will likely die of old age before it's done.
The smarter one is to try to understand how data is encoded and optimize it somehow.

First of all, each input character is only responsible for some distinct bits on the image
(if we ignore error correction part).
This fact gives us the ability to brute force them separately.  
And reduces the complexity from 10<sup>N</sup> to 10*N, which is much smaller.

QR codes have 4 possible modes of encoding:
- Numeric
- Alphanumeric
- Byte
- Kanji

Byte mode will give us great control over the data.
But random bytes will almost certainly break link detection so it's no good.

Alphanumeric mode is okay for links but it cannot produce many of the bit patterns. And we need **ALL** of them.

Numeric mode is okay with links too.
And it uses special compression to fit more data.
The numbers are broken into groups of three and then treated like a single 3-digit number before converting to 10-digit binary.
10-digit binary numbers can have 1024 possible states.
So we have `1000 / 1024 * 100% = 97.6%` coverage of bit patterns.
Sounds good but what about this error correction?


## Error correction

All QR codes **must** have at least some error correction.
It can range from 7 to 30 percent of possibly recoverable data.
I recommend setting the lowest possible value to leave more space for your image.

The whole error correction section changes very unpredictably after any slight change in the input data.
If you try to place your image in this section, random changes will confuse the algorithm and it will produce some garbage.
EC section is appended to the end of your original message. 
On the generated code it's on the left side.
Make sure to avoid it, should be easily detectable if you try to encode a large group of identical characters.

## Masking

*That one gave me a lot of troubles until I discovered a workaround.*  
Masks were designed to make codes easier to read.
They achieve it by breaking large chunks of the same bits into smaller ones.
That trick helps the software to count blocks more precisely.
They are not essential for reading, but all generators try hard to choose the best one.

But images usually need to contain large blocks of similar color.
As soon as you've made some progress, mask changes and everything looks random again.
Luckily, I've found a python library for QR code generation that allows us to override mask selection.  
There are 8 of them. If expression is true, current bit flips.

0. (row + column) mod 2 == 0
1. (row) mod 2 == 0
2. (column) mod 3 == 0
3. (row + column) mod 3 == 0
4. ( floor(row / 2) + floor(column / 3) ) mod 2 == 0
5. ((row * column) mod 2) + ((row * column) mod 3) == 0
6. ( ((row * column) mod 2) + ((row * column) mod 3) ) mod 2 == 0
7. ( ((row + column) mod 2) + ((row * column) mod 3) ) mod 2 == 0

You can choose any one of them, it should be fine.
Just make sure it's not changing in the middle of your brute force.

## Overall structure

There are many versions of QR codes.
The bigger the version, the more data you can put in.
Unfortunately bigger ones should always have alignment patterns (this little squares with one dot inside).
But you can at least try to place your art in such a way that they would fit naturally.


## The code
```python
#!/usr/bin/python3

import qrcode
from PIL import Image
from random import randint, choice


#Load image and convert it to 2d array of booleans
#False is white pixels True is black pixel
img = Image.open("./img.png")
(w, h) = img.size
print("Got image size:",w, h)
bitmap = [[False if sum(img.getpixel((j,i))) > 255 else True for j in range(w)] for i in range(h)]
for row in bitmap:
    print(row)
img.close()


#Function to calculate the percentage of similarity
def calc(qr, data, starty, startx):
    h = len(data)
    w = len(data[0])
    matr = qr.get_matrix()
    total = h*w
    match = 0;
    for i in range(0, h):
        for j in range(0, w):
            if matr[starty+i][startx+j] == data[i][j]:
                match+=1

    return match / total


url = "https://techadv.xyz/posts/qrart/#"
#This is hand-picked by trial and error
#Try to fit as much as u can
PSIZE = 1461
#Fill payload with zeroes
payload = ['0' for _ in range(PSIZE)]
best = 0
# Position of image within the QR code
startx = 20
starty  = 20
qr = qrcode.QRCode(version=17,#Size of code
        error_correction=qrcode.constants.ERROR_CORRECT_L, # Lowes error correction
        box_size=1, #Size of one qr module
        border=0
        )

# Overriding mask pattern
qr.mask_pattern = 0
# Looping over triples 
for p in range(0,PSIZE,3):
    print(p)
    # Searching for the best fitting one
    bestletter = '000'
    localbest = best
    for c in range(1000):
        sc = str(c)
        while len(sc) < 3:
            sc = '0'+sc
        payload[p] = sc[0]
        payload[p+1] = sc[1]
        payload[p+2] = sc[2]
        qr.clear()
        qr.add_data(url+"".join(payload))
        res = calc(qr, bitmap, starty, startx)

        if res > localbest:
            bestletter = sc
            localbest = res

    payload[p] = bestletter[0]
    payload[p+1] = bestletter[1]
    payload[p+2] = bestletter[2]

    #Update global best and save results
    qr.clear()
    qr.add_data(url+"".join(payload))
    best = calc(qr, bitmap, starty, startx)
    qr.border = 2
    qr.make()
    img = qr.make_image(fill_color="black", back_color="white")
    qr.border = 0
    img.save("res.png")

    #This is not neccesary but nice to have
    #Draw image on top of qr code so you can
    #compare current result to the ideal one
    bord = 2
    pix = img.load()
    for i in range(0, h):
        for j in range(0, w):
            if bitmap[i][j]:
                pix[startx+j+bord,starty+bord+i] = 0
            else:
                pix[startx+bord+j,starty+bord+i] = 1
    img.save("res_ideal.png")


print("\n\n")
print(qr.mask_pattern,best)
print(url+"".join(payload))
```


## The end

Good luck trying this trick.
It can take some time, so I recommend practicing with smaller ones.
Be sure to share results with me if you create something.
You can send them in [telegram](https://t.me/deedone).
If you don't have telegram, just drop the link in the [subscription form](/subscribe) (you can write anything in there), I will see it eventually.
Also, if you want to know more about the inner workings of QR codes, check out [this tutorial](https://www.thonky.com/qr-code-tutorial/introduction).



*__Remember to create exponentially__*
