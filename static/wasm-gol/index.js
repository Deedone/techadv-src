import('./pkg')
    .then(wasm => {
        const canvas = document.getElementById('drawing');
        const dbgcanvas = document.getElementById('debug');
        const ctx = canvas.getContext('2d');
        const dbgctx = dbgcanvas.getContext('2d');
        const stepBtn = document.getElementById("step");
        const toggleBtn = document.getElementById("toggle");
        const reinitBtn = document.getElementById("reinit");
        const dbgToggle = document.getElementById("dbgToggle");
        let anim = false;
        let down = false;
        let w = document.body.clientWidth;
        let h = w;
        canvas.width = w;
        canvas.height = h;
        dbgcanvas.width = w;
        dbgcanvas.height = h;
        dbgcanvas.style.left = canvas.offsetLeft;
        dbgcanvas.style.top = canvas.offsetTop;

        stepBtn.onclick = () => {
            wasm.draw(ctx, w, h, true);
            if (dbgToggle.checked){
                wasm.draw_debug(dbgctx, w, h);
            }
        }

        dbgToggle.addEventListener('input', (e) => {
            if(dbgToggle.checked){
                dbgcanvas.style.visibility = "visible";
            }else{
                dbgcanvas.style.visibility = "hidden";
            }

        })

        reinitBtn.onclick = () => {
            wasm.init( w/7, h/7, Math.floor(Math.random() * 999999));
            wasm.draw(ctx, w, h, false);
        }

        dbgcanvas.addEventListener('mousedown', () => {
            down = true;
        })
        dbgcanvas.addEventListener('mouseup', () => {
            down = false;
        })
        dbgcanvas.addEventListener('mousemove', (e) => {
            if (!down) return;
            let x = e.pageX - canvas.offsetLeft;
            let y = e.pageY - canvas.offsetTop;
            console.log(x,y);
            wasm.click(x,y, w, h);
            wasm.draw(ctx, w, h, false);
        });

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
            if (dbgToggle.checked){
                wasm.draw_debug(dbgctx, w, h);
            }
            if (anim) { 
                requestAnimationFrame(step);
            }
        }
        wasm.init( w/7, h/7, Math.floor(Math.random() * 99999));

        wasm.draw(ctx, w, h, false);

    })
    .catch(console.error);
