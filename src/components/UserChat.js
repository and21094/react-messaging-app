import React from 'react';
import { Realtime } from 'ably/browser/static/ably-commonjs.js';

import '../css/UserChat.css';

class UserChat extends React.Component {

    state = {username: '', userId: '', connected: false, members: [], openChats: [], systemMessages: [], message: '', receivedMessages: []}
    
    connectUser =  () => {

        window.Ably = new Realtime({key: 'LVIkoQ.JX3Zrw:FcA71g3D2IQW-G3q', clientId: this.state.username});
        window.channel = window.Ably.channels.get('chatroom');
        window.channel.attach((err) => {
            if(err) {
                return console.error("Error attaching to the channel");
            }
                console.log('We are now attached to the channel');
                window.channel.presence.enter('chat', (err) => {
                    if(err) {
                        return console.error("Error entering presence");
                    }
                    console.log('We are now successfully present');

                    this.setState({
                        connected: true
                    });

                    setTimeout(() => {
                        window.channel.presence.get( (err, members) => {
                            if(err) {
                                return console.error("Error fetching presence data");
                            }

                            members.forEach(member => {
                                if (member.clientId === this.state.username) {

                                    this.setState({
                                        userId: member.id
                                    });
                                    return;
                                }
                            });
                            this.setState({
                                members
                            });
                        });
                    });

                    window.channel.presence.subscribe((newMember) => {
                        var tempMembers = this.state.members;
                        if (newMember.action === 'enter') {
                            tempMembers.push(newMember)
                            this.setState({
                                members: tempMembers
                            });
                        } else if (newMember.action === 'leave') {
                            for (let i = 0; i < tempMembers.length; i++) {
                                if (tempMembers[i].clientId === newMember.clientId) {
                                    tempMembers.splice(i, 1);
                                    this.setState({
                                        members: tempMembers
                                    });
                                    i = tempMembers.length;
                                }
                            }
                        }
                    });

                    window.channel.subscribe( (message) => {

                        var messageClientId = message.clientId;
                        var messageId = message.name.split(',')[1];
                        var MessageChat = {id: messageId, clientId: messageClientId};
                        if (!this.state.openChats.length && this.state.username !== message.clientId && this.state.username === message.name.split(',')[0]) {
                            var tempChat = this.state.openChats;
                            tempChat.push(MessageChat);
                            this.setState({
                                openChats: tempChat
                            })
                        } else {
                            for (let i = 0; i < this.state.openChats.length; i++) {
                                if (this.state.openChats[i].id === MessageChat.id) {
                                    i = this.state.openChats.length;
                                } else if (i === this.state.openChats.length -1 && this.state.username !== message.clientId && this.state.username === message.name.split(',')[0]) {
                                    var tempChat = this.state.openChats;
                                    tempChat.push(MessageChat);
                                    this.setState({
                                        openChats: tempChat
                                    })
                                }
                            };
                        }

                        var tempMessages = []
                        if (message.name === 'system') {
                            tempMessages = this.state.systemMessages;
                            tempMessages.push(message)
                            this.setState({
                                systemMessages: tempMessages
                            })
                        } else {
                            tempMessages = this.state.receivedMessages;
                            tempMessages.push(message)
                            this.setState({
                                receivedMessages: tempMessages
                            })
                        }
                    });

                });
        });
        
    }

    addChat = (member) => {
        if (member.id !== this.state.userId) {
            var tempChats = this.state.openChats;
            tempChats.push({id: member.id, clientId: member.clientId});
            this.setState ({
                openChats: tempChats
            });
        }
    }

    sendMessage = (chat, input) => {
        window.channel.publish(`${chat.clientId},${this.state.userId}`, this.state.message);
        setTimeout(() => {
          input.value = '';  
          this.setState({
            message: ''
          });
        });
    }

    renderMessages = (chat) => {
        if (this.state.receivedMessages.length) {
            return this.state.receivedMessages.map((message) => {
                var messageName = message.name.split(',')[0];
                if (this.state.username === messageName && chat.clientId === message.clientId) {
                    return (
                        <p key={message.id}>
                            {message.clientId +': '+ message.data}
                        </p>
                    );
                } else if (message.clientId === this.state.username && chat.clientId === messageName) {
                    return (
                        <p key={message.id}>
                            {message.clientId +': '+ message.data}
                        </p>
                    );
                }
            })
        }
    }

    showMembers = () => {
        return this.state.members.map((member) => {
            return (
                <div className="mt-2 mb-2" style={{cursor: 'pointer'}} key={member.id} onClick={() => this.addChat(member)}>
                    <i className="fas fa-circle" style={{color:'green'}}></i>
                    &nbsp;
                    {member.id === this.state.userId ? `${member.clientId} (you)` : member.clientId }
                </div>
            );
        });
    }
    
    renderUsername = () => {
        if (!this.state.connected) {
            return (
                <div className="col-12">
                    {this.state.connected}
                    <p>
                        Please Enter your name to start
                    </p>
                    <input type="text" style={{display: 'inline', width: '40%', minWidth: '200px'}} className="form-control mb-3" placeholder="Username" onChange={(e) => this.setState({username: e.target.value})}/>
                    <br/>
                    <button type="button" className="btn btn-primary" onClick={this.connectUser}>Start</button>
                </div>  
            );
        } else {
            return (
                <div className="col-12">
                    <p>
                        Your username is <strong> {this.state.username} </strong>
                    </p>
                </div>
            ); 
        }
    }

    showChats = () => {
        if (!this.state.openChats.length) {
            return (
                <p className="mt-5 w-100">Select someone online to chat!</p>
            );
        } else {
            return this.state.openChats.map((chat) => {
                return (
                    <div key={chat.id}  className="col-5 card m-1" style={{height: '55vh'}}>
                        <p className="chat-header">
                            chat with {chat.clientId}
                        </p>
                        <div className="overflow-auto" style={{height: '37vh'}}>
                            {this.renderMessages(chat)}
                        </div>
                        <input id={`chat-input-${chat.clientId}`} type="text" className="form-control" placeholder="Write..." onChange={(e) => this.setState({message: e.target.value})}/>
                        <button type="button" className="btn btn-primary mt-1" onClick={() => this.sendMessage(chat, document.getElementById(`chat-input-${chat.clientId}`))}>Send</button>
                    </div>
                );
            })
        }
    }

    showSystemMessages = () => {
        if (!this.state.systemMessages.length) {
            return (
                <p>There's no system messages yet</p>
            );
        } else {
            return this.state.systemMessages.map((message) => {
                return (
                    <p>{message.data}</p>
                );
            });
        }
    }

    renderChat = () => {
        if (this.state.connected) {
            return (
                <div className="row">
                    <div className="col-9 card">
                       <div className="chat-header">chat</div>
                       <div className="row d-flex justify-content-center">
                            <div className="col-8 card m-1" style={{height: '60vh'}}>
                                <div className="row center-text overflow-auto d-flex justify-content-center">
                                    {this.showChats()}
                                </div>
                            </div>
                            <div className="col-3 card m-1 overflow-auto" style={{height: '60vh'}}>
                                <p className="chat-header mb-5">System Messages</p>
                                {this.showSystemMessages()}
                            </div>
                       </div>
                    </div>
                    <div className="col-3 card active-users">
                        <div className="chat-header">users</div>
                        {this.showMembers()}
                    </div>
                </div>
            )
        }
    }

    render () {
        return (
            <div>
                <div className="row">
                    {this.renderUsername()}
                </div>
                    {this.renderChat()}
            </div>
        );
    }
}

export default UserChat;