// dependencies ------------------------------------------------------------

import aws     from '../libs/aws';
import scitran from '../libs/scitran';

// handlers ----------------------------------------------------------------

/**
 * Jobs
 *
 * Handlers for job actions.
 */
let handlers = {

    /**
     * Create Job Definition
     */
    createJobDefinition() {

    },

    /**
     * Describe Job Definitions
     */
    describeJobDefinitions(req, res, next) {
        aws.batch.sdk.describeJobDefinitions({}, (err, data) => {
            if (err) {
                return next(err);
            } else {
                let definitions = {};
                for (let definition of data.jobDefinitions) {
                    if (!definitions.hasOwnProperty(definition.jobDefinitionName)) {
                        definitions[definition.jobDefinitionName] = {};
                    }
                    definitions[definition.jobDefinitionName][definition.revision] = definition;
                }

                res.send(definitions);
            }
        });
    },

    /**
     * Submit Job
     */
    submitJob(req, res) {
        let job = req.body;

        const batchJobParams = {
            jobDefinition: job.jobDefinition,
            jobName:       job.jobName,
            parameters:    job.parameters
        };
        batchJobParams.jobQueue = 'bids-queue';

        scitran.downloadSymlinkDataset(job.snapshotId, (err, hash) => {
            aws.s3.uploadSnapshot(hash, () => {
                aws.batch.sdk.submitJob(batchJobParams, (err, data) => {
                    res.send(data);
                });
            });
        });
    }

};

export default handlers;