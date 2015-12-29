'use strict';

angular.module('bahmni.common.displaycontrol.diagnosis')
    .directive('bahmniDiagnosis', ['diagnosisService', '$q', 'spinner', '$rootScope', 'appService',
        function (diagnosisService, $q, spinner, $rootScope, appService) {
            var controller = function ($scope) {
                var getAllDiagnosis = function () {
                    var programConfig = appService.getAppDescriptor().getConfigValue("program");
                    var startDate = null, endDate = null;
                    if(programConfig.showDashBoardWithinDateRange){
                        startDate = $scope.config.dateEnrolled;
                        endDate = $scope.config.dateCompleted;
                    }
                    return diagnosisService.getDiagnosis($scope.patientUuid, $scope.visitUuid, startDate, endDate).success(function (response) {
                        var diagnosisMapper = new Bahmni.DiagnosisMapper($rootScope.diagnosisStatus);
                        $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                            if ($scope.showRuledOutDiagnoses == false) {
                                $scope.allDiagnoses = _.filter($scope.allDiagnoses, function (diagnoses) {
                                    return diagnoses.diagnosisStatus !== $rootScope.diagnosisStatus;
                                });
                        }
                    });
                };
                $scope.title = $scope.config.title;
                $scope.toggle = function (diagnosis, toggleLatest) {
                    if (toggleLatest) {
                        diagnosis.showDetails = false;
                        diagnosis.showLatestDetails = !diagnosis.showLatestDetails;
                    } else {
                        diagnosis.showLatestDetails = false;
                        diagnosis.showDetails = !diagnosis.showDetails;
                    }
                };

                var getPromises = function () {
                    return [getAllDiagnosis()];
                };

                $scope.isLatestDiagnosis = function (diagnosis) {
                    return diagnosis.latestDiagnosis ? diagnosis.existingObs == diagnosis.latestDiagnosis.existingObs : false;
                };

                spinner.forPromise($q.all(getPromises()));
            };
            return {
                restrict: 'E',
                controller: controller,
                templateUrl: "../common/displaycontrols/diagnosis/views/diagnosisDisplayControl.html",
                scope: {
                    patientUuid: "=",
                    config: "=",
                    visitUuid: "=",
                    showRuledOutDiagnoses: "=",
                    hideTitle: "=",
                    showLatestDiagnosis: "@showLatestDiagnosis"
                }
            }
        }]);
