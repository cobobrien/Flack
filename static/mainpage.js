if (!localStorage.getItem('username'))
    localStorage.setItem('username', "");

document.addEventListener('DOMContentLoaded', function() {

       var scrolled = false;
       function updateScroll(){
             if(!scrolled){
                var element = document.getElementById("testtest");
                element.scrollTop = element.scrollHeight;
             }
        }
        setInterval(updateScroll,1000);

        $("#testtest").on('scroll', function(){
            scrolled=true;
        });

    if(localStorage.getItem('channel')){
        const c = localStorage.getItem('channel');
        c_id = '#' + c;
        t_id = '#' + c + 'tab'
        const active = document.querySelector(c_id);
        const active_tab = document.querySelector(t_id);
        active.className += " active show";
        active_tab.className += " active show";
    }
    if (!localStorage.getItem('username')){
            $('#exampleModal').modal('show')
            document.querySelector('#saveusr').onclick = () => {
                 var name = document.getElementById("usr").value
                 localStorage.setItem('username',name);
                 document.querySelector('#username').innerHTML = `@${name}`;
            }
    }
    else{
        const usr_name = localStorage.getItem('username');
        document.querySelector('#username').innerHTML = `@${usr_name}`;
    }

    document.addEventListener( "click", channelListener );
    function channelListener(event){
        var element = event.target;
        if(element.classList.contains("list-group-item")){
            var channel_to_store = element.id;
            localStorage.setItem('channel',channel_to_store);
            scrolled=false;
            updateScroll();
        }
    }

    document.querySelector('#savechannel').onclick = () => {
         const a = document.createElement('a');
         let channel_id = document.querySelector('#channel_name').value;
         a.innerHTML = channel_id;
         a.className = "list-group-item list-group-item-action";
         a.id = channel_id;
         a.href = "#" + channel_id + "tab";
         a.dataset.toggle = "list";
         a.role = "tab";
         a.setAttribute("aria-controls", channel_id + "-control");

         const tab = document.createElement('div');
         tab.className = "tab-pane fade";
         tab.id = a.id + "tab";
         tab.role = "tabpanel";
         tab.setAttribute("aria-labelledby", channel_id);

          // Initialize new request
          const request = new XMLHttpRequest();
          const channel_name =  a.innerHTML;
          request.open('POST', '/channel');

          // Callback function for when request completes
          request.onload = () => {

              // Extract JSON data from request
              const data = JSON.parse(request.responseText);

              // Update the result div
              if (data.success) {
                  document.querySelector('#list-tab').append(a);
                  document.querySelector('#nav-tabContent').append(tab);
              }
              else {
                    const alert = document.querySelector('#channel_alert');
                    alert.style.display = "",
                    alert.innerHTML = "Channel name already in use. Please pick another name";

              }
          }

          // Add data to send with request
          const data = new FormData();
          data.append('channel_name', channel_name);

          // Send request
          request.send(data);

    }
    document.querySelector('#channel_done').onclick = () => {
        document.querySelector('#channel_name').value = "";
    }

    // Connect to websocket
    var socket = io.connect('http://127.0.0.1:5000');

    // When connected, configure buttons
    socket.on('connect', () => {

        // Each button should emit a "submit vote" event
        document.querySelector('#message_submit').onclick = () => {

                var message = document.querySelector('#message_send').value;
                var sender = localStorage.getItem('username');
                var currentdate = new Date().toLocaleTimeString();
                var channel = localStorage.getItem('channel');
                socket.emit('submit message', {"message": message, "sender":sender,"timestamp":currentdate, "channel":channel});
                document.querySelector('#message_send').value = "";

        };
    });

      // When a new vote is announced, add to the unordered list
    socket.on('message submitted', data => {
         const p = document.createElement('p');
         const time = document.createElement('footer');
         var channel = data["channel"];
         var recent = data["message"];
         var timefooter = data["time"];

         p.innerHTML = "<b>"+ "@" + data["sender"] + ": " + "</b>" + recent;
         time.innerHTML = "<b>"+ timefooter + "</b>";
         p.appendChild(time);
         const divID = '#' + channel + 'tab';
         console.log(divID);
         document.querySelector(divID).append(p);
         scrolled=false;
         updateScroll();
    });

});

