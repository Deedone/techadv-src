#[macro_use]
extern crate lazy_static;
extern crate web_sys;

use std::sync::Mutex;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;
use web_sys::{CanvasRenderingContext2d};

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
pub fn draw(ctx: &CanvasRenderingContext2d, cwidth:u32, cheight: u32, upd:bool) -> Result<(), JsValue> {


    if upd {
        update();
    }

    render(ctx, cwidth, cheight)
}
#[wasm_bindgen]
pub fn init(width: u32, height: u32){
    console_error_panic_hook::set_once();
    let mut data = DATA.lock().unwrap();
    data.w = width;
    data.h = height;

    data.field1.resize((width*height) as usize , 0);
    data.field2.resize((width*height) as usize , 0);
    data.near_alive.resize((width*height) as usize, 0);


    data.cur = 0;
    //for i in 0..(width*height) {
        //let (x, y) = data.idx2coord(i);

        //data.set(x,y, (i%7) as u8);
    //}

    data.set(50,50,1);
    data.set(51,51,1);
    data.set(51,52,1);
    data.set(50,52,1);
    data.set(49,52,1);

    data.cur = 1;
}
fn render(ctx: &CanvasRenderingContext2d, cwidth:u32, cheight: u32) -> Result<(), JsValue> {
    let data = DATA.lock().unwrap();

    let xfactor = cwidth / data.w ;
    let yfactor = cheight / data.h ;

    let black = JsValue::from_str("#000000");
    let white = JsValue::from_str("#FFFFFF");
    let red = JsValue::from_str("rgba(255,0,0,0.5");

    for idx in data.near_alive_list.iter() {
        let (x,y) = data.idx2coord(*idx);
        if data.get(x, y) == 1{
            ctx.set_fill_style(&black);
        }else {
            ctx.set_fill_style(&white);
        }
        ctx.fill_rect((x*xfactor) as f64, (y*yfactor) as f64, xfactor as f64, yfactor as f64);
    }
    Ok(())
}

#[wasm_bindgen]
pub fn click(x:u32, y:u32, cwidth:u32, cheight:u32) {
    let mut data = DATA.lock().unwrap();
    let w = cwidth / data.w;
    let h = cheight / data.h;

    let cur = data.get(x/w,y/h);
    data.toggle();

    data.set(x/w,y/h, 1);

    data.toggle();
}

fn update(){
    let mut data = DATA.lock().unwrap();
    let next_cpy = data.near_alive_list.clone();
    for i in data.near_alive.iter_mut(){ 
        *i = 0 as u8;
    }
    data.near_alive_list.clear();

    for i in next_cpy.iter() {
        let (x,y) = data.idx2coord(*i);
        let mut alive = 0;

        for dy in [data.h - 1, 0, 1].iter(){ 
            for dx in [data.w - 1, 0 ,1].iter() {
                if (data.get((x+dx) % data.w, (y+dy) % data.h)) == 1 {
                    alive += 1;
                }
            }
        }
        let cell = data.get(x, y);
        if cell == 1 {
            // Remove self from count
            alive-=1;
        }
        if alive == 3 {
            data.set(x, y, 1);
        }else if alive == 2 && cell == 1 {
            data.set(x, y, 1);
        }else{
            data.set(x, y, 0);

        }
    }
    data.toggle();
}


#[derive(Debug)]
struct Internal {
    w: u32,
    h: u32,
    field2 : Vec<u8>,
    field1 : Vec<u8>,
    cur: u32,
    near_alive: Vec<u8>,
    near_alive_list: Vec<u32>

}

impl Internal {

    fn coord2idx(&self,x:u32, y: u32) -> u32{
        y * self.w + x
    }

    fn idx2coord(&self, i:u32) -> ( u32, u32 ){
        (i % self.w, i / self.w)
    }

    fn append_near(&mut self, x: u32, y: u32) {

        for dy in [self.h -1, 0, 1].iter(){ 
            for dx in [self.w-1, 0 ,1].iter() {
                let idx = self.coord2idx((x+dx) % self.w, (y+dy) % self.h);
                if self.near_alive[idx as usize] == 0{
                    self.near_alive[idx as usize]  = 1;
                    self.near_alive_list.push(idx);
                }
            }
        }
    }

    fn toggle(&mut self){
        if self.cur == 1 {
            self.cur = 0;
        }else{
            self.cur = 1;
        }
    }

    fn set(&mut self,x:u32, y:u32, val:u8) {
        let idx = self.coord2idx(x, y);
        let old = self.get(x,y);
        if old != val {
            self.append_near(x, y);
        }

        if self.cur == 0{
            self.field1[idx as usize] = val;
        }else{
            self.field2[idx as usize] = val;
        }
    }

    fn get(&self, x:u32, y:u32) -> u8 {
        if self.cur == 0{
            self.field2[self.coord2idx(x, y) as usize]
        }else{
            self.field1[self.coord2idx(x, y) as usize]
        }
    }
}

lazy_static! {
    static ref DATA: Mutex<Internal> = {
        let m = Mutex::new(Internal{w:0, h:0, field1:Vec::new(), field2:Vec::new(), cur:1, near_alive:Vec::new(), near_alive_list:Vec::new()});
        m
    };
}

