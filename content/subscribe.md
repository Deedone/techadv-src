---
title: "Subscribe via Email"
date: 2020-05-02T22:21:29+03:00
---

You will receive Emails when new posts come out.
Don't worry, I will never send spam and you always can unsubscribe.


<div id="form">
<input type="text" id="data" placeholder="Your Email address"></input>
<button onclick="send()">Subscribe</button>
</div>
<p id="ty" style="display:none;">Than you for subscribing</p>


<script>

function send() {
let url = "https://tg-feedback.herokuapp.com/";
var xhr = new XMLHttpRequest();
xhr.open("POST", url, true);

xhr.send(document.getElementById("data").value);
document.getElementById("form").style.display="none";
document.getElementById("ty").style.display="block";

}

</script>


