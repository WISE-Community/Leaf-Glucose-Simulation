/**
 * Parse the GET URL parameters
 * @return an object containing the key/value pairs of the parameter names/values
 */
export function parseURLParameters() {

    var parameters = {};
    
    /*
     * get the text in the URL starting with the ?
     * e.g.
     * If the full URL is
     * "http://wise.berkeley.edu/curriculum/12345/assets/mymodel.html?feedbackPolicy=experiment2b&showGraph=false"
     * search would be this
     * "?feedbackPolicy=experiment2b&showGraph=false"
     */
    var search = location.search;

    if (search != null && search != '') {

        if (search.indexOf('?') == 0) {
            /*
             * remove the ?
             * e.g.
             * "feedbackPolicy=experiment2b&showGraph=false"
             */
            search = search.substring(1);
        }

        /*
         * split the string at &
         * e.g.
         * parameterPairs[0]="feedbackPolicy=experiment2b"
         * parameterPairs[1]="showGraph=false"
         */
        var parameterPairs = search.split('&');

        if (parameterPairs != null) {

            for (var p = 0; p < parameterPairs.length; p++) {
                var parameterPairString = parameterPairs[p];

                if (parameterPairString != null) {

                    /*
                     * split the string at =
                     * e.g.
                     * parameterPair[0]="feedbackPolicy"
                     * parameterPair[1]="experiment2b"
                     */
                    var parameterPair = parameterPairString.split('=');

                    if (parameterPair != null) {
                        var parameterName = parameterPair[0];
                        var parameterValue = parameterPair[1];

                        if (parameterValue == "true") {
                            /*
                             * the value is the string "true" so we will convert
                             * it from a string to a boolean value
                             */
                            parameterValue = true;
                        } else if (parameterValue == "false") {
                            /*
                             * the value is the string "false" so we will convert
                             * it from a string to a boolean value
                             */
                            parameterValue = false;
                        } else if (!isNaN(parameterValue)) {
                            /*
                             * the value is a number so we will convert it from
                             * a string to a number
                             */
                            parameterValue = parseFloat(parameterValue);
                        }

                        // set the parameter into our parameters object
                        parameters[parameterName] = parameterValue;
                    }
                }
            }
        }
    }

    return parameters;
}
