/**
* Responds to an ADDED_TO_SPACE event in Google Chat.
* @param {object} event the event object from Google Chat
* @return {object} JSON-formatted response
*/
function onAddToSpace(event) {
    console.info(event);
    var message = 'Thank you for adding me to ';
    if (event.space.type === 'DM') {
      message += 'a DM, ' + event.user.displayName + '!';
    } else {
      message += event.space.displayName;
    }
    console.log('Attendance Bot added in ', event.space.name);
    return { text: message };
  }
  /**
  * Responds to a REMOVED_FROM_SPACE event in Google Chat.
  * @param {object} event the event object from Google Chat
  */
  function onRemoveFromSpace(event) {
    console.info(event);
    console.log('Bot removed from ', event.space.name);
  }
  
  
  var DEFAULT_IMAGE_URL = 'https://goo.gl/bMqzYS';
  var HEADER = {
    header: {
      title: 'Attendance Bot',
      subtitle: 'Log your Attendance',
      imageUrl: DEFAULT_IMAGE_URL
    }
  };
  /**
   * Creates a card-formatted response.
   * @param {object} widgets the UI components to send
   * @return {object} JSON-formatted response
   */
  function createCardResponse(widgets) {
    return {
      cards: [HEADER, {
        sections: [{
          widgets: widgets
        }]
      }]
    };
  }
  /**
   * Responds to a MESSAGE event triggered
   * in Google Chat.
   *
   * @param event the event object from Google Chat
   * @return JSON-formatted response
   */
  var REASON = {
    SICK: 'Out sick',
    OTHER: 'Out of office',
    WORKING: 'Working'
  };
  /**
   * Responds to a MESSAGE event triggered in Google Chat.
   * @param {object} event the event object from Google Chat
   * @return {object} JSON-formatted response
   */
  function onMessage(event) {
    console.info(event);
    var reason = REASON.OTHER;
    var name = event.user.displayName;
    var userMessage = event.message.text;
    var textMessage=''
    // If the user said that they were 'sick', adjust the image in the
    // header sent in response.
    if (userMessage.indexOf('sick') > -1) {
      // Hospital material icon
      HEADER.header.imageUrl = 'https://goo.gl/mnZ37b';
      reason = REASON.SICK;
      textMessage="Are taking leave today?"
    } else if (userMessage.indexOf('vacation') > -1) {
      // Spa material icon
      HEADER.header.imageUrl = 'https://goo.gl/EbgHuc';
      textMessage="Are taking leave today?"
    } else if (userMessage.indexOf('working') > -1) {
      HEADER.header.imageUrl = 'https://fonts.gstatic.com/s/i/materialiconsoutlined/work_outline/v6/24px.svg?download=true';
      reason = REASON.WORKING;
      textMessage="set your attendance for today"
    }
    var widgets = [{
      textParagraph: {
        text: 'Hello, ' + name + '.<br>'+textMessage
      }
    }]
    if (reason === REASON.WORKING) {
      widgets.push({
        buttons: [{
          textButton: {
            text: 'Set Attendance',
            onClick: {
              action: {
                actionMethodName: 'blockOutCalendar',
                parameters: [{
                  key: 'reason',
                  value: reason
                }]
              }
            }
          }
        }]
      })
    }
    else {
      widgets.push({
        buttons: [{
          textButton: {
            text: 'Set Leave in Gmail',
            onClick: {
              action: {
                actionMethodName: 'turnOnAutoResponder',
                parameters: [{
                  key: 'reason',
                  value: reason
                }]
              }
            }
          }
        }]
      });
  
  
  
      widgets.push({
        buttons: [{
          textButton: {
            text: 'Block out day in Calendar',
            onClick: {
              action: {
                actionMethodName: 'blockOutCalendar',
                parameters: [{
                  key: 'reason',
                  value: reason
                }]
              }
            }
          }
        }]
      });
  
    }
    return createCardResponse(widgets);
  }
  /**
   * Responds to a CARD_CLICKED event triggered in Google Chat.
   * @param {object} event the event object from Google Chat
   * @return {object} JSON-formatted response
   */
  function onCardClick(event) {
    console.info(event);
    var message = '';
    var reason = event.action.parameters[0].value;
    if (event.action.actionMethodName == 'turnOnAutoResponder') {
      turnOnAutoResponder(reason);
      message = `Turned on leave settings.`;
    } else if (event.action.actionMethodName == 'blockOutCalendar') {
      blockOutCalendar(reason);
      message = 'Blocked out your calendar for the day.';
      sendEmail(reason)
    } else {
      message = "I'm sorry; I'm not sure which button you clicked.";
    }
    return { text: message };
  }
  
  var ONE_DAY_MILLIS = 24 * 60 * 60 * 1000;
  /**
   * Turns on the user's leave response for today in Gmail.
   * @param {string} reason the reason for vacation, either REASON.SICK or REASON.OTHER
   */
  function turnOnAutoResponder(reason) {
    var currentTime = (new Date()).getTime();
    Gmail.Users.Settings.updateVacation({
      enableAutoReply: true,
      responseSubject: reason,
      responseBodyHtml: "I'm out of the office today; will be back on the next business day.<br><br><i>Created by Attendance Bot!</i>",
      restrictToContacts: true,
      restrictToDomain: true,
      startTime: currentTime,
      endTime: currentTime + ONE_DAY_MILLIS
    }, 'me');
  
  
  
    //API call here for portal   //example
    // const response= UrlFetchApp.fetch("https://dummyjson.com/products/1")
    // const res=JSON.parse(response.getContentText())
    // return res
  
  }
  /**
   * Sends Email to Webknot mail 
   * 
   */
  function sendEmail(reason) {
    var emailRecipient = 'prajwal@webknot.in';
    var emailSubject = reason;
    var emailBody = reason;
  
    GmailApp.sendEmail(emailRecipient, emailSubject, emailBody);
  }
  /**
   * Places an all-day meeting on the user's Calendar.
   * @param {string} reason the reason for vacation, either REASON.SICK or REASON.OTHER
   */
  function blockOutCalendar(reason) {
    CalendarApp.createAllDayEvent(reason, new Date(), new Date(Date.now() + ONE_DAY_MILLIS));
  }