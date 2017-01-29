/**
 * Created by Yigit Yesilpinar on 28.01.2017.
 */

(function () {
    window.onload = function () {
        // io (socket.io Global object is provided with script above)
        var socket = io();

        // Containers and inputs
        var message_send = document.getElementById("message_send");
        var message_input = document.getElementById("message_input");
        var message_container = document.getElementById("message_container");
        var change_name = document.getElementById("change_name");
        var user_name = document.getElementById("user_name");
        var user_list = document.getElementById("user_list");
        var userName ="";

        // Client list
        var userList = [];

        // Send message, emits chat message event
        message_send.addEventListener("click",function (event) {
            event.preventDefault();
            if(message_input.value){
                socket.emit('chat message',  {msg:message_input.value, socket_id: socket.id});
                message_input.value = "";
            }
            return false;
        }, false);

        // Change user name , IF NOT empty string or existing user name, emits name changed event
        change_name.addEventListener("click",function (event) {
            event.preventDefault();
            userList= [];
            Array.prototype.forEach.call(user_list.childNodes,function (li) {
                userList.push(li.innerText);
            });

            if(userList.indexOf(user_name.value) !=-1 || user_name.value === ""){

                var popUp =document.getElementById("exist_popup");
                if(popUp){

                }
                else{
                    popUp = document.createElement("div");
                    popUp.classList.add("exist");
                    popUp.id= "exist_popup";
                    popUp.style.backgroundColor ="#fff";
                    var popText = document.createTextNode("User name already exist");
                    if(user_name.value === ""){
                        popText = document.createTextNode("User name can't be empty");
                    }
                    popUp.appendChild(popText);

                    user_name.parentNode.insertBefore(popUp,user_name);
                    var fade = setInterval(function() {


                        popUp.style.opacity =(parseFloat(window.getComputedStyle(popUp).opacity) -0.03 );
                    }, 100);
                    setTimeout(function() {
                        if(popUp){
                            popUp.parentNode.removeChild(popUp);
                            clearInterval(fade);
                        }
                    }, 2000); // <-- time in milliseconds
                }
                user_name.value = userName;
            }
            else {
                socket.emit('name changed',  {newName:user_name.value, socket_id: socket.id});
                userName = user_name.value;
                var popUp =document.getElementById("exist_popup");
                if(popUp){
                    popUp.parentNode.removeChild(popUp);
                }

            }


            return false;
        },false);


        // scroll functions for containers
        function scrollDownUserList() {
            user_list.scrollTop = user_list.scrollHeight;
        }
        function scrollDownMessageContainer() {
            message_container.scrollTop = message_container.scrollHeight;
        }

        // Add sent message to message container
        function addToChat(data) {
            var li = document.createElement("li");
            if(data.socket_id === socket.id){
                li.classList.add("self_message");
            }
            var text = data.user + ' says: ' + data.msg;
            var textNode = document.createTextNode(text);
            li.appendChild(textNode); //add the text node to the newly created li.
            message_container.appendChild(li);
            scrollDownMessageContainer();
        }

        // New message emitted addd to message container
        socket.addEventListener('chat message', function(data){

            addToChat(data);

        }, false);

        // New user connected
        socket.addEventListener('user connected', function(data){

            var li;
            var text;
            var textNode;

            // User connected to current socket (current browser tab, current user)
            if(socket.id === data.socket_id){
                user_name.value = data.user;
                userName =  data.user;
                li = document.createElement("li");
                li.classList.add("welcome");
                text = "Welcome to the Chat App " + data.user + "!";
                textNode = document.createTextNode(text);
                li.appendChild(textNode);
                message_container.insertBefore(li, message_container.childNodes[0]);

                var users = document.getElementById("user_list").childNodes;

                Array.prototype.forEach.call(users,function (li) {
                    if(li.innerText === userName){
                      li.classList.add("self");
                    }
                });
                document.getElementById("user_span").innerText = userName;
            }
            else{
                // Let other users know about the new user
                 li = document.createElement("li");
                 li.classList.add("joined");
                 text = data.user + " has joined the chat room!";
                 textNode = document.createTextNode(text);
                 li.appendChild(textNode);
                 message_container.appendChild(li);
                 scrollDownMessageContainer();
            }

        }, false);

        // User disconnected
        socket.addEventListener('user disconnected', function(data){

            var li;
            var text;
            var textNode;

            if(socket.id === data.socket_id){
                //
            }
            else{
                // Let other users know which user has disconnected
                li = document.createElement("li");
                li.classList.add("left");
                text = data.user + " has left the chat room!";
                textNode = document.createTextNode(text);
                li.appendChild(textNode);
                message_container.appendChild(li);
                scrollDownMessageContainer();
            }

        }, false);


        // Let everybody know about user name change
        socket.addEventListener('name changed', function(data){
            var li;
            var text;
            var textNode;

            li = document.createElement("li");
            li.classList.add("changed");
            text = data.user + " has changed name to " + data.newName + "!";
            textNode = document.createTextNode(text);
            li.appendChild(textNode);
            message_container.appendChild(li);
            if(socket.id=== data.socket_id)
            document.getElementById("user_span").innerText = data.newName;
            scrollDownMessageContainer();

        }, false);


        // Update the user-list container when neccessary
        socket.addEventListener('user list changed', function(data){
            var li;
            var textNode;

            var newList = document.createElement("ul");
            newList.id= "user_list";
            newList.classList.add("dynamic-container");
            user_list.parentNode.replaceChild(newList, user_list);
            user_list = newList;

            //A.parentNode.replaceChild(document.createElement("span"), A);
            data.userList.forEach(function (user) {
                li = document.createElement("li");
                li.classList.add("user");

                // Current user
                if(userName === user){
                    li.classList.add("self");
                }

                textNode = document.createTextNode(user);
                li.appendChild(textNode);
                user_list.appendChild(li);
            });

            scrollDownUserList();

        }, false);


    };

}());