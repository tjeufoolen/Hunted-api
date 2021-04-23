const cron = require('cron').CronJob;
const moment = require('moment');

class CronManager{
    constructor(){
        this._jobs = {};
    }

    /**
     * 
     * @param {string} name 
     * @param {string} interval 
     * @param {*} callback 
     * @param {datetime} endDateTime (moment js)
     */
    add(name, interval, callback, endDateTime){
        this._jobs[name] = {
            name: name,
            cron: new cron(`*/${interval} * * * *`, () => {
                if(moment() > endDateTime){
                    this.stop(name);
                    return;
                }

                callback()
            }, null, true),
            endDateTime: endDateTime
        };
    }

    stop(name) {
        if(this._jobs[name] != undefined){
            this._jobs[name].cron.stop()
            this.delete(name)
        }
    }

    delete(name) {
        if(this._jobs[name] != undefined) delete this._jobs[name];
    }

    stopAll() {
        for (const cron in this._jobs) {
            const job = this._jobs[cron];
            if (this.running(job.name)) 
                this.stop(job.name);
        }
    }

    list() {
        return this._jobs;
    }

    running(name) {
        if(this._jobs[name] != undefined){
            return this._jobs[name].cron.running;
        }
    }

    lastDate(name) {
        return this._jobs[name].cron.lastDate();
    }

    nextDates(name) {
        return this._jobs[name].cron.nextDates();
    }
}

module.exports = new CronManager();