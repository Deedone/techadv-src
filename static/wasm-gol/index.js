import('./pkg')
    .then(wasm => {
        const canvas = document.getElementById('drawing');
        const ctx = canvas.getContext('2d');
        const stepBtn = document.getElementById("step");
        const toggleBtn = document.getElementById("toggle");
        let anim = false;
        let down = false;
        let w = document.body.clientWidth;
        let h = w;
        canvas.width = w;
        canvas.height = h;

        stepBtn.onclick = () => {
            wasm.draw(ctx, w, h, true);
        }

        canvas.addEventListener('mousedown', () => {
            down = true;
        })
        canvas.addEventListener('mouseup', () => {
            down = false;
        })
        canvas.addEventListener('mousemove', (e) => {
            if (!down) return;
            let x = e.pageX - canvas.offsetLeft;
            let y = e.pageY - canvas.offsetTop;
            console.log(x,y);
            wasm.click(x,y, w, h);
            wasm.draw(ctx, w, h, false);
        });

        toggleBtn.onclick = () => {
            anim = !anim;
            if (anim){
                step();
            }
        }
        let step = () => {
            wasm.draw(ctx, w, h, true);
            if (anim) {
                requestAnimationFrame(step);
            }
        }
        wasm.init( 200, 200);

        wasm.draw(ctx, w, h, false);

    })
    .catch(console.error);
