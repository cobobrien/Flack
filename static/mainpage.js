if (!localStorage.getItem('username'))
    localStorage.setItem('username', "");

document.addEventListener('DOMContentLoaded', function() {

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
        }
    }

    document.querySelector('#savechannel').onclick = () => {
         const a = document.createElement('a');
         a.innerHTML = document.querySelector('#channel_name').value;
         a.className = "list-group-item list-group-item-action";
         a.id = document.querySelector("#channel_name").value;
         a.href = "#" + document.querySelector("#channel_name").value;
         a.dataset.toggle = "list";
         a.role = "tab";
         a.setAttribute("aria-controls", document.querySelector("#channel_name").value);

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
                var currentdate = new Date();
                var channel = localStorage.getItem('channel');
                socket.emit('submit message', {"message": message, "sender":sender,"timestamp":currentdate, "channel":channel});

        };
    });

      // When a new vote is announced, add to the unordered list
    socket.on('message submitted', data => {
         const p = document.createElement('p');
         var channel = localStorage.getItem('channel');
         p.innerHTML = data[channel].pop()["message"];
         document.querySelector('#messages').append(p);
    });

});

