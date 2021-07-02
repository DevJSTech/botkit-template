//
// Test Conversation
// Project Owner - JS
// Example of a conversation with a menu that loops until explicitly stopped
//

const { BotkitConversation } = require( 'botkit' );

module.exports = function (controller) {

    const convo = new BotkitConversation( 'test_command_chat', controller );

    convo.say('Hi there! Welcome to Project Dolphin\'s Announcement Service!');


    let question = 'Select from one of the options below to get started:\n';
    question += '  1. Make an announcement ( announce )\n';
    question += '  2. Exit service  ( exit )\n';
    question += 'How can I help?\n(type a number, a ( keyword ) )';

    convo.ask( question, [
        {
            pattern: '1|announce',
            handler: async (response, convo, bot) => {
                return await convo.gotoThread( 'menu_1' );
            }
        },
        {
            pattern: '2|exit',
            handler: async (response, convo, bot) => {
                return await convo.gotoThread( 'menu_2' );
            }
        },
        {
            default: true,
            handler: async (response, convo, bot) => {
                await bot.say( 'Unrecognized response...  \nTry again!' );
                return await convo.repeat();
            },
        }  
    ]);

    // Menu option 1 - Make announcement)
    convo.addMessage({
        text: 'To start making an announcement, enter the email of the Webex user below to select a recipient of your announcement!\n\n',
        action: 'recipient_info'
    }, 'menu_1');

    // adding next action
    convo.addAction('recipient_info');

    convo.addQuestion('Announcement Target?\n', [
        {
            default: true,
            handler: async (response, convo, bot) => {}
        }
    ], {key: 'send_to_email'}, 'recipient_info');

    convo.addQuestion('Selected user {{vars.send_to_email}}. Enter "yes" to confirm or "no" to enter again\n', [
        {
            pattern: 'yes',
            handler: async (response, convo, bot) => {
                await bot.say( 'Confirmed!\n' );
                return await convo.gotoThread( 'get_announcement' );
            }
        },
        {
            pattern: 'no',
            handler: async (response, convo, bot) => {
                return await convo.gotoThread( 'recipient_info' );
            }
        }
    ], {key: 'send_to_email'}, 'recipient_info');

    // adding next action
    convo.addAction('get_message');

    convo.addQuestion('Great! Now enter your message below or "cancel" to stop this service!\n', [
        {
            pattern: 'cancel',
            handler: async (response, convo, bot) => {
                await bot.say( 'Okay cancelling announcement! Thanks for visiting!\n' );
                return await convo.gotoThread( 'default' );
            }
        },
        {
            default: true,
            handler: async (response, convo, bot) => {
                return await convo.gotoThread( 'get_message' );
            }
        }
    ], {key: 'send_this_message'}, 'get_message');

    convo.addQuestion('Message received! Send it now? "yes" to send or "cancel" to stop this service!\n', [
        {
            pattern: 'yes',
            handler: async (response, convo, bot) => {
                await bot.say( 'Sending your message to {{vars.send_to_email}}!\n' );
            }
        },
        {
            default: true,
            handler: async (response, convo, bot) => {
                await bot.say( 'Okay cancelling announcement! Thanks for visiting!\n' );
                return await convo.gotoThread( 'default' );
            }
        }
    ], {key: 'send_confirmation'}, 'get_message');



    // Menu option 2)
    convo.addMessage({
        text: 'Learnings Labs are step-by-step tutorials. ' +
            'They are grouped into tracks to help you on your learning journey. ' +
            'Browse through the learnings tracks here: https://learninglabs.cisco.com/login\n\n',
        action: 'default'
    }, 'menu_2');

    // Cancel
    convo.addMessage({
        text: 'Got it, cancelling...',
        action: 'complete',
    }, 'action_cancel');


    controller.addDialog( convo );

    controller.hears( 'announcements', 'message,direct_message', async ( bot, message ) => {

        await bot.beginDialog( 'test_command_chat' );
    });

    controller.commandHelp.push( { command: 'announcements', text: 'Start announcement service' } );

};