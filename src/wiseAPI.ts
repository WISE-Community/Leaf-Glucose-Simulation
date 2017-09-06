/**
 * Class to communicate with WISE to save/retrieve data
 */
export class WISEAPI {
    // flag for whether we are using the model in WISE4
    wise4: boolean = false;
    // flag for whether we are using the model in WISE5
    wise5: boolean = false;
    // the WISE webapp object in WISE4
    wiseWebAppObj: any;

    studentWorkFromThisNode: any;

    // work from other components
    studentWorkFromOtherComponents: any;

    constructor() {

      // check if the model is being used in WISE4
      if (window.parent != null && window.parent.wiseAPI != null) {
          /*
           * the wiseAPI object is in the parent which means this model is being
           * used in WISE4
           */
          this.wise4 = true;

          // obtain the WISE API and webApp object
          this.wiseAPI = window.parent.wiseAPI();
          this.wiseWebAppObj = window.parent.webApp;
      }

      // check if the model is being used in WISE5
      if (window.frameElement != null) {
          var iframeId = window.frameElement.getAttribute('id');

          if (iframeId != null && iframeId.indexOf('componentApp') != -1) {
              /*
               * the iframe id is something like 'componentApp_kcb5ikb3wl' which means
               * this model is being used in WISE5
               */
              this.wise5 = true;
          }
      }

      if (this.wise5) {
          getStudentWork();
      }

      // listen for messages from the parent
      window.addEventListener('message', this.receiveMessage);
    }

    /**
     * Save the student data to WISE
     */
    save() {
        if (this.wise4) {
            // this model is being used in WISE4

            if (wiseAPI != null) {
                // save the trial data to WISE
                this.wiseAPI.save(trialData);
            }
        } else if (this.wise5) {
            // this mode is being used in WISE5

            // create a component state
            var componentState = {};
            componentState.isAutoSave = false;
            componentState.isSubmit = false;
            componentState.studentData = trialData;

            // save the component state to WISE
            saveWISE5State(componentState);
        }
    }

    /**
     * Send an event to the parent
     * @param event the event object
     */
    saveWISE5Event(event) {
        event.messageType = 'event';
        sendMessage(event);
    }

    /**
     * Send a component state to the parent
     * @param componentState the component state
     */
    saveWISE5State(componentState) {
        componentState.messageType = 'studentWork';
        sendMessage(componentState);
    }

    /**
     * Send a message to the parent
     * @param the message to send to the parent
     */
    sendMessage(message) {
        parent.postMessage(message, "*");
    }

    /**
     * Receive a message from the parent
     * @param message the message from the parent
     */
    receiveMessage(message) {

        if (message != null) {
            var messageData = message.data;

            if (messageData != null) {
                if (messageData.messageType == 'studentWork') {
                    /*
                     * we have received a message that contains student work from
                     * other components
                     */
                    this.studentWorkFromThisNode = messageData.studentWorkFromThisNode;
                    this.studentWorkFromOtherComponents = messageData.studentWorkFromOtherComponents;

                } else if (messageData.messageType == 'nodeSubmitClicked') {
                    /*
                     * the student has clicked the submit button and the student
                     * work has been included in the message data
                     */
                    this.studentWorkFromThisNode = messageData.studentWorkFromThisNode;
                    this.studentWorkFromOtherComponents = messageData.studentWorkFromOtherComponents;
                } else if (messageData.messageType == 'componentStateSaved') {
                    var componentState = messageData.componentState;
                }
            }
        }
    }

    /**
     * Get student work from other components by asking the parent for the work
     */
    getStudentWork() {

        // make a message to request the other student work
        var message = {
            messageType: "getStudentWork"
        };

        // send the message to request the other student work
        sendMessage(message);
    }

    /**
     * Get the student work for a given node id and component id
     * @param nodeId the node id
     * @param componentId the component id
     * @return the component state for the component. if there is no work for
     * the component, an object with a node id field and component id field will
     * be returned.
     */
    getStudentWorkByNodeIdAndComponentId(nodeId, componentId) {

        var componentState = null;

        if (nodeId != null && componentId != null) {
            if (this.studentWorkFromThisNode != null) {

                // loop through the component states from this node
                for (var c = 0; c < this.studentWorkFromThisNode.length; c++) {

                    // get a component state
                    var tempComponentState = this.studentWorkFromThisNode[c];

                    if (tempComponentState != null) {
                        var tempNodeId = tempComponentState.nodeId;
                        var tempComponentId = tempComponentState.componentId;

                        if (nodeId == tempNodeId && componentId == tempComponentId) {
                            // we have found the component state we are looking for
                            componentState = tempComponentState;
                            break;
                        }
                    }
                }
            }

            if (studentWork == null && this.studentWorkFromOtherComponents != null) {

                // loop through the component states from other nodes
                for (var c = 0; c < this.studentWorkFromOtherComponents.length; c++) {

                    // get a component state
                    var tempComponentState = this.studentWorkFromOtherComponents[c];

                    if (tempComponentState != null) {
                        if (tempComponentState != null) {
                            var tempNodeId = tempComponentState.nodeId;
                            var tempComponentId = tempComponentState.componentId;

                            if (nodeId == tempNodeId && componentId == tempComponentId) {
                                // we have found the component state we are looking for
                                componentState = tempComponentState;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return componentState;
    }
}
