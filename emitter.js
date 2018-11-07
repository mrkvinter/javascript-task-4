'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function getSubEvents(event) {
    let subEvents = [];
    let index = event.length;
    do {
        event = event.substring(0, index);
        subEvents.push(event);
    } while ((index = event.lastIndexOf('.')) !== -1);

    return subEvents;
}

function emitContexts(contexts) {
    for (let c of contexts.keys()) {
        contexts.get(c)
            .forEach(context => {
                if ((context.several === -1 || context.several > 0) &&
                    (context.numberCall) % context.through === 0) {
                    context.handler.call(c);
                }
                context.numberCall++;
                if (context.several !== -1 && context.several !== 0) {
                    context.several--;
                }
            });
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        events: new Map(),

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} properties
         * @returns {Object}
         */
        on: function (event, context, handler) {
            if (!this.events.has(event)) {
                this.events.set(event, new Map());
            }
            if (this.events.get(event).has(context)) {
                this.events.get(event).get(context)
                    .push({ handler: handler, several: -1, through: -1, numberCall: 0 });
            } else {
                this.events
                    .get(event)
                    .set(context,
                        [{
                            handler: handler,
                            several: -1,
                            through: -1,
                            numberCall: 0
                        }]);
            }

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            if (!this.events.has(event)) {
                return this;
            }
            this.events.get(event).delete(context);
            for (let key of this.events.keys()) {
                if (key.startsWith(event + '.')) {
                    this.events.get(key).delete(context);
                }
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            for (let e of getSubEvents(event)) {
                if (!this.events.has(e)) {
                    continue;
                }
                let contexts = this.events.get(e);
                emitContexts(contexts);
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (!this.events.has(event) || !this.events.get(event).has(context)) {
                this.on(event, context, handler);
            }
            let c = this.events.get(event)
                .get(context)
                .slice(-1)[0];
            c.several = times;

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            this.on(event, context, handler);
            let c = this.events.get(event)
                .get(context)
                .slice(-1)[0];
            c.through = frequency;

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
