import React from 'react';
import { Realtime } from 'ably/browser/static/ably-commonjs.js';

import '../css/UserChat.css';

class AdminChat extends React.Component {

    state = {message: '', members: [], messagesSent: []}

    componentDidMount () {
        window.Ably = new Realtime({key: 'LVIkoQ.JX3Zrw:FcA71g3D2IQW-G3q'});
        window.channel = window.Ably.channels.get('chatroom');

        setTimeout(() => {
            window.channel.presence.get( (err, members) => {
                if(err) {
                    return console.error("Error fetching presence data");
                }

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
    }

    sendMessage = (input) => {
        window.channel.publish(`system`, this.state.message);
        setTimeout(() => {
          input.value = '';
          var tempMessages = this.state.messagesSent;
          tempMessages.push(this.state.message)
          this.setState({
            message: '',
            messagesSent: tempMessages
          });
        });
    }

    showMembers = () => {
        return this.state.members.map((member) => {
            return (
                <div className="mt-2 mb-2" style={{cursor: 'pointer'}} key={member.id}>
                    <i className="fas fa-circle" style={{color:'green'}}></i>
                    &nbsp;
                    { member.clientId }
                </div>
            );
        });
    }

    renderMessages = () => {
        if (this.state.messagesSent.length) {
            return this.state.messagesSent.map((message, i) => {
                return (
                    <p key={i}>
                        Message sent: {message}
                    </p>
                );
            })
        }
    }

    render () {
        return (
            <div className="row">
                <div className="col-12">
                    <p>System Admin Chat</p>
                </div>
                <div className="col-9 card chat">
                    <div className="chat-header">System Messages</div>
                    <div className="row d-flex justify-content-center">
                        <div className="col-8 card m-1" style={{height: '60vh'}}>
                            <div className="row center-text overflow-auto d-flex justify-content-center">
                                <div className="col-12 overflow-auto" style={{height: '47vh'}}>
                                    {this.renderMessages()}
                                </div>
                                <div className="col-12">
                                    <input id="chat-input" type="text" className="form-control" placeholder="Write..." onChange={(e) => this.setState({message: e.target.value})}/>
                                    <button type="button" className="btn btn-primary mt-1" onClick={() => this.sendMessage(document.getElementById('chat-input'))}>Send</button>
                                </div>
                            </div>
                        </div>
                        {/* {this.showSystemMessages()} */}
                    </div>
                </div>
                <div className="col-3 card active-users">
                    <div className="chat-header">users</div>
                    {this.showMembers()}
                </div>
            </div>
        );
    }
}

export default AdminChat;