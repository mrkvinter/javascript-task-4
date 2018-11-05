'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

function* getSubEvents(event) {
    var eventStr = event;
    yield eventStr;
    let index;
    while ((index = eventStr.lastIndexOf('.')) !== -1) {
        eventStr = eventStr.substring(0, index);
        yield eventStr;
    }
}

function emitContexts(contexts) {
    for (let c of contexts.keys()) {
        let context = contexts.get(c);
        context.numberCall++;
        if ((context.numberCall - 1) % context.through !== 0) {
            continue;
        }
        if (context.several === 1) {
            contexts.delete(c);
        }

        context.several--;
        context.handler.call(c);
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
            this.events
                .get(event)
                .set(context,
                    {
                        handler: handler,
                        several: -1,
                        through: -1,
                        numberCall: 0
                    });

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
            let c = this.events.get(event).get(context);
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
            if (!this.events.has(event) || !this.events.get(event).has(context)) {
                this.on(event, context, handler);
            }
            let c = this.events.get(event).get(context);
            c.through = frequency;

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
