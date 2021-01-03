/**
 * WISEAPI --- Class to communicate with WISE to save/retrieve data
 * before/during/after the simulation.
 * @author Hiroki Terashima
 * @author Geoffrey Kwan
 * @author Jonathan Lim-Breitbart
 */

import { PlantGlucoseSimulation } from "./plantGlucoseSimulation";

export class WISEAPI {
  isWISE4: boolean = false;
  isWISE5: boolean = false;
  wiseAPI: any;
  wiseWebAppObj: any;
  simulation: PlantGlucoseSimulation;
  studentWorkFromThisNode: any;
  studentWorkFromOtherComponents: any;

  constructor(simulation: PlantGlucoseSimulation) {
    this.simulation = simulation;
    if (window.parent != null && window.parent.wiseAPI != null) {
      /*
       * the wiseAPI object is in the parent which means this model is being
       * used in WISE4
       */
      this.isWISE4 = true;
      this.wiseAPI = window.parent.wiseAPI();
      this.wiseWebAppObj = window.parent.webApp;
    }
    if (window.frameElement != null) {
      let iframeId = window.frameElement.getAttribute('id');
      if (iframeId != null && iframeId.indexOf('componentApp') != -1) {
        /*
         * the iframe id is something like 'componentApp_kcb5ikb3wl' which means
         * this model is being used in WISE5+
         */
        this.isWISE5 = true;
        this.getStudentWork();
      }
    }

    // listen for messages from the parent
    window.addEventListener('message', (ev) => {
      const self = this;
      this.receiveMessage(ev, self);
    });
  }

  /**
   * Save the student trial data to WISE
   */
  saveTrialData(trialData: any) {
    if (this.isWISE4) {
      if (this.wiseAPI != null) {
        this.wiseAPI.save(trialData);
      }
    } else if (this.isWISE5) {
      let componentState = {
        isAutoSave: false,
        isSubmit: false,
        studentData: trialData
      };
      this.saveWISE5State(componentState);
    }
  }

  /**
   * Send an event to the parent
   * @param event the event object
   */
  saveWISE5Event(event: any) {
    event.messageType = 'event';
    this.sendMessage(event);
  }

  /**
   * Send a component state to the parent
   * @param componentState the component state
   */
  saveWISE5State(componentState: any) {
    componentState.messageType = 'studentWork';
    this.sendMessage(componentState);
  }

  /**
   * Send a message to the parent
   * @param the message to send to the parent
   */
  sendMessage(message: any) {
    //console.log('sending message:' + JSON.stringify(message));
    if (parent != null) {
      parent.postMessage(message, "*");
    }
  }

  /**
   * Receive a message from the parent
   * @param message the message from the parent
   */
  receiveMessage(message: any, api: WISEAPI) {
    if (message != null) {
      const messageData = message.data;
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
          const componentState = messageData.componentState;
        } else if (messageData.messageType == 'handleConnectedComponentStudentDataChanged') {
          const componentState = messageData.componentState;
          if (componentState.componentType == 'Embedded') {
              api.showModelStateFromEmbedded(componentState)
          }
        }
      }
    }
  }

  showModelStateFromEmbedded(componentState: any) {
    const studentData = componentState.studentData;
    if (studentData && studentData.type === 'snap') {
      const instructions = studentData.instructions;
      if (instructions) {
        this.simulation.loadInstructions(instructions);
      }
    }
  }

  /**
   * Get student work from other components by asking the parent for the work
   */
  getStudentWork() {
    let getStudentWorkRequest = {
      messageType: "getStudentWork"
    };
    this.sendMessage(getStudentWorkRequest);
  }

  /**
   * Get the student work for a given node id and component id
   * @param nodeId the node id
   * @param componentId the component id
   * @return the component state for the component. if there is no work for
   * the component, an object with a node id field and component id field will
   * be returned.
   */
  /*
  getStudentWorkByNodeIdAndComponentId(nodeId: string, componentId: string) {
    let componentState = null;
    if (nodeId != null && componentId != null) {
      if (this.studentWorkFromThisNode != null) {

        // loop through the component states from this node
        for (let c = 0; c < this.studentWorkFromThisNode.length; c++) {

          // get a component state
          let tempComponentState = this.studentWorkFromThisNode[c];

          if (tempComponentState != null) {
            let tempNodeId = tempComponentState.nodeId;
            let tempComponentId = tempComponentState.componentId;

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
        for (let c = 0; c < this.studentWorkFromOtherComponents.length; c++) {

          // get a component state
          let tempComponentState = this.studentWorkFromOtherComponents[c];

          if (tempComponentState != null) {
            if (tempComponentState != null) {
              let tempNodeId = tempComponentState.nodeId;
              let tempComponentId = tempComponentState.componentId;

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
  */
}
