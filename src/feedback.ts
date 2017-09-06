export class Feedback {
    draw: any;
    feedbackRect: any;
    feedbackText: any[];

    // What feedback policy to use - options are defined experiments (currently, 2a and 2b)
    // default, or none (null works here too, indicating none).
    feedbackPolicy = null;

    feedbackShowing = false;
    feedbackInstructions: string[] = ["Click start again to start your new trial."];
    feedbackMessageNeverTurnsLightOff: string[] = ["You've never run the simulation with the","light off. Try experimenting with turning ", "the light off during a simulation to see", "what happens."];
    feedbackMessageOnlyShortTrials: string[] = ["All of your trials have been very short.", "Try letting the simulation run", "for more time."];
    feedbackMessagePlantNeverDied: string[] = ["You've run several trials, but never","seen what makes the plant die.", "See if you can make a simulation", "where the plant dies."];
    feedbackMessageLongTrialRunningTime: string[] = ["You've been running simulations for a","long time. Are you still gaining information", "as you run more trials?"];
    feedbackMessageMoveOnOrAsk: string[] = ["You've already collected enough information","from the simulation. Keep working through","the questions and other steps. If","you're stuck, ask your teacher for help."];
    feedbackMessageDoFourWeeksOnTrial: string[] = ["Now that you've experimented with the ", "simulation a bit, try turning the light on for ", "four weeks and then turning it off. Watch ", "what happens to the plant and to the","glucose levels."];

    // Tracking variables for whether the trial is an appropriate one to consider feedback
    minTrialsBeforeFeedback: number = 2;
    intervalBetweenFeedbackTrials: number = 2;
    lastFeedbackTrial: number = -1;

    // Variables relevant for what feedback to give - these
    // could be recalculated by going through trials, but it seemed
    // reasonable to cache as we go
    trialWithLightOffOccurred: boolean = false;
    longestTrial: number = 0;
    totalDaysRun: number = 0; // How many days of trial data have been recorded across all simulations
    plantHasEverDied: boolean = false;
    shortTrialCutoff: number = 2000;
    daysRunCutoff: number = 60; // After the student has run the simulation for at least this number of weeks, the feedback message prompts her to consider whether she's still learning.

    // Tried to do this all with maps but got error on construction or error when actually setting key-values, so went back to objects
    policySpecificFeedbackInfo: any = {templateMatches: {}}; //object for storing information for feedback that may be relevant only to a single feedback policy
    // Templates we care about - trials that are matches will be stored in policySpecificFeedbackInfo under templateMatches
    templatesByFeedbackPolicy: any = {experiment2b: [[-1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]}
    templateNamesByFeedbackPolicy: any = {experiment2b:["fourWeeksOn"]};

    constructor(draw: any, feedbackPolicy: string = null) {
        this.draw = draw;
        this.feedbackPolicy = feedbackPolicy;

        // create the message rectangle
        this.feedbackRect = this.draw.rect(500, 300).x(50).y(200)
          .fill('LightYellow').stroke({width:2}).opacity(1).attr({
            'fill-opacity': 1
          });

        // create the message text
        this.feedbackText = [];

        // hide the elements until we want to show them
        this.feedbackRect.hide();
    }

    /**
     * Called when feedback should be shown
     */
    showFeedback(trials: any[]) {

        if (this.feedbackPolicy == null || this.feedbackPolicy == "none") {
            //Don't show feedback
            return "";
        }
        let feedbackMessage = this.getFeedbackMessage(trials.length);

        if (feedbackMessage != "") {
            // create the feedback shown event
            this.addEvent('Feedback shown: ' + feedbackMessage);

            this.feedback.showFeedback(feedbackMessage, trials.length);

            //Save to WISE
            wiseAPI.save();

            // initialize the trial data
            startNewTrial();

            feedbackShowing = true;
            return;
        }

        // Record that feedback is being shown this trial
        this.lastFeedbackTrial = trials.length;

        // move the feedback elements in front of everything
        this.feedbackRect.front();
        this.feedbackText.front();

        // create the message text
        this.feedbackText = [];
        var startingYValue = 210;
        var totalLines = feedbackMessage.length;
        if (feedbackMessage != feedbackMessageMoveOnOrAsk) {
            totalLines += feedbackInstructions.length;
        }
        for (var i = 0; i < totalLines; i++) {
            var curYValue = startingYValue + i*50;
            var curLine;
            if (i < feedbackMessage.length) {
                curLine = feedbackMessage[i];
            } else {
                curLine = feedbackInstructions[i - feedbackMessage.length];
            }
            var curText = this.draw.text(curLine).x(80).y(curYValue).font({size: 24});
            this.feedbackText.push(curText);
        }
        this.feedbackRect.show();
    }

    /**
     * Hide all the lines of the feedback text message.
     */
    hideFeedback() {
        this.feedbackRect.hide();

        for (var i = 0; i < this.feedbackText.length; i++) {
            this.feedbackText[i].hide();
        }
    }

    /**
     * Looks at what trials have already been done and if relevant,
     * gets a feedback message
     */
    getFeedbackMessage(numTrials: number) {
        //Check if we've done more than the minimum trials required prior to
        //feedback and also whether it's been at least intervalBetweenFeedbackTrials
        //since our last feedback trial. The -1 is because the feedback itself added
        //to the trial count.
        if (this.feedbackPolicy == null || this.feedbackPolicy == "none") {
            //Don't show feedback
            return "";
        } else if (feedbackPolicy == "experiment2a") {
            //Try turning the light on and off. Strategy feedback should tell them to try both if they haven't
            //done that already after 2 runs. Also, if they run the model for more than 60 total weeks, it should
            //tell them to move on.
            if (numTrials >= 2) {
                if (!trialWithLightOffOccurred) {
                    return feedbackMessageNeverTurnsLightOff;
                } else if (totalDaysRun > 60) {
                    return feedbackMessageMoveOnOrAsk;
                }

            }
        } else if (feedbackPolicy == "experiment2b") {
            //Leave the light on for four weeks and then turn it off and let the plant die.
            //Strategy feedback should just tell the students to do that if they don't do it on
            //their own after, say, running the model in any configuration for more than 6 weeks.
            //Plus, after the students do that, maybe let them run the same experiment once more, and
            //after that if if they're still running it, tell them they don't need to run the model
            //any more - either move on or ask the teacher for help.
            if (totalDaysRun >= 6) {
                if ("fourWeeksOn" in policySpecificFeedbackInfo.templateMatches) {
                    //They've done the requested trial at least once
                    //Check if they've had the chance to try it once more (indicated
                    //by having done one more trial after the match. If not, let them
                    //keep going; if so, then tell them to move on.
                    if (numTrials > policySpecificFeedbackInfo.templateMatches["fourWeeksOn"][0]) {
                        return feedbackMessageMoveOnOrAsk;
                    }
                } else {
                    //They haven't done the requested trial - tell them to do so
                    return feedbackMessageDoFourWeeksOnTrial;
                }
            }
        } else {
            if (numTrials >= minTrialsBeforeFeedback &&
                (lastFeedbackTrial < 0 || (numTrials - 1 - lastFeedbackTrial) >= intervalBetweenFeedbackTrials) ) {
                if (!trialWithLightOffOccurred && pgm.isLightOn) {
                    return feedbackMessageNeverTurnsLightOff;
                } else if (longestTrial < shortTrialCutoff) {
                    return feedbackMessageOnlyShortTrials;
                } else if (!plantHasEverDied) {
                    return feedbackMessagePlantNeverDied;
                } else if (totalDaysRun > daysRunCutoff) {
                    return feedbackMessageLongTrialRunningTime;
                }
            }
        }
        return "";
    }

    /**
     * Records information for the latest trial in the global variables
     * tracking information that affects what feedback message to give
     */
    recordInfoForFeedback(trialData: any, numTrials: number) {
        // Light off
        var lightOffForTrial = trialIncludesLightOff(trialData);
        trialWithLightOffOccurred = trialWithLightOffOccurred || lightOffForTrial;

        // Timing info
        var timeForTrial = getTrialTime(trialData);
        if (timeForTrial > longestTrial) {
            longestTrial = timeForTrial;
        }

        // Total running time, measured in days
        totalDaysRun += trialData.glucoseCreatedData.length - 1//-1 because 0th week is always stored

        // Plant death occurred
        var plantEverDied = plantDiedInTrial(trialData);
        plantHasEverDied = plantHasEverDied || plantEverDied;

        // Record any policy specific info
        if (feedbackPolicy != null) {
            if (typeof templatesByFeedbackPolicy[feedbackPolicy] != "undefined") {
                var templatesToCheck = templatesByFeedbackPolicy[feedbackPolicy];
                for (var i = 0; i < templatesToCheck.length; i++) {
                    if (trialMatchesTemplate(trialData, templatesToCheck[i])) {
                        var templateName = templateNamesByFeedbackPolicy[feedbackPolicy][i];
                        if (!policySpecificFeedbackInfo.templateMatches.hasOwnProperty(templateName)) {
                            policySpecificFeedbackInfo.templateMatches[templateName] = [];
                        }
                        // Template matches are just lists of trial numbers where the trials matched
                        policySpecificFeedbackInfo.templateMatches[templateName].push(numTrials);
                    }
                }
            }
        }
    }

    /**
     * Returns true if the plant died during the trial represented by trialData
     */
    plantDiedInTrial(trialData) {
        let events = trialData.events;
        for (let i = 0; i < events.length; i++) {
            if (events[i].name === 'plantDied') {
                return true;
            }

        }
        return false;
    }

    /**
     * Return the number of milliseconds taken for the trial
     * Define as amount of time where the simulation is actually
     * running (not paused).
     */
    getTrialTime(trial) {
        //Iterate through the array of events
        let events = trial.events;
        let running = false;
        let startTime = null;
        let totalTime = 0;
        for (let i = 0; i < events.length; i++) {
            let curEvent = events[i];
            let curName = curEvent.name;
            let lastEventTime = curEvent.timestamp;
            if (curName === 'startButtonClicked') {
                running = true;
                startTime = curEvent.timestamp;
            } else if (curName == 'pauseButtonClicked') {
                running = false;
                totalTime += (lastEventTime - startTime);
            } else if (curName == 'resumeButtonClicked') {
                running = true;
                startTime = curEvent.timestamp;
            } else if (curName == 'plantDied') {
                running = false;
                totalTime += (lastEventTime - startTime);
            } else if (curName == 'resetButtonClicked') {
                if (running) {
                    totalTime += (lastEventTime - startTime);
                }
            }
        }
        return totalTime;
    }

    /**
     * Check if trial has included time with the simulation running
     * and the light off.
     */
    trialIncludesLightOff(trial) {
        //Iterate through the array of events
        let events = trial.events;
        let running = false;
        let lightTurnedOff = false;
        for (let i = 0; i < events.length; i++) {
            let curEvent = events[i];
            let curName = curEvent.name;
            if (curName === 'startButtonClicked') {
                running = true;
                if (lightTurnedOff) {
                    return true;
                }
            } else if (curName === 'turnLightOffButtonClicked') {
                lightTurnedOff = true;
                if (running) {
                    return true;
                }
            } else if (curName == 'turnLightOnButtonClicked') {
                lightTurnedOff = false;
            } else if (curName == 'pauseButtonClicked') {
                running = false;
            } else if (curName == 'resumeButtonClicked') {
                running = true;
            }

        }
        return false;
    }

    /**
     * Checks whether the trial matches the template provided. Templates
     * should be 21 weeks long (max trial length) and should have an integer
     * at each spot in the array. -1 means we don't care about whether the light was
     * on that week (light on, off, or plant dead are all fine). 0 means we care
     * and the light must be off or the plant has died. 1 means we
     * care and the light must be on. 2 means the plant should be dead (either it just died
     * or the week doesn't exist in the trial). We are measuring this by transitions,
     * so "week 1 light is on" is measured as whether the glucose created went up from
     * week 0 to week 1. Thus, the value at week 0 in the template is ignored.
     *
     * Returns true if the trial matches the template,
     * false otherwise.
     */
    trialMatchesTemplate(trialData, template) {
        for (let i = 1; i < template.length; i++) {
            if (template[i] == 0) {//Want plant dead or light off
                //Check whether this exists in the trial
                //if plant isn't dead and made glucse this week, light is on - doesn't match
                if (trialData.glucoseCreatedData.length > i && trialData.glucoseCreatedData[i][1] - trialData.glucoseCreatedData[i-1][1] > 0) {
                    return false;
                }
            } else if (template[i] == 1) {//Want light on, plant can't be dead
                //Check whether this exists in the trial
                //Either plant is already dead or no glucose made this week, so light is off - doesn't match
                if (trialData.glucoseCreatedData.length <= i || trialData.glucoseCreatedData[i][1] - trialData.glucoseCreatedData[i-1][1] <= 0) {
                    return false;
                }
            } else if (template[i] == 2) {//Want plant dead
                //Plant either died this week or is already dead
                if (trialData.glucoseStoredData.length > i && trialData.glucoseStoredData[i] >= 0) {
                    //Plant is still alive and has glucose - doesn't match
                    return false;
                }
            }
        }
        return true;
    }
}
