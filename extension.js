const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Calendar = imports.gi.Calendar;
const GnomeDesktop = imports.gi.GnomeDesktop;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

let indicator;

const CalendarTaskIndicator = new Lang.Class({
    Name: 'CalendarTaskIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "Calendar Task Indicator", false);
        this.actor.add_style_class_name('panel-status-button');

        let icon = new St.Icon({
            icon_name: 'appointment-soon-symbolic',
            style_class: 'system-status-icon'
        });
        this.actor.add_child(icon);
        
        this._label = new St.Label({
            text: "No task",
            y_align: Clutter.ActorAlign.CENTER
        });
        this.actor.add_child(this._label);

        this._updateTask();
        this._timeout = 0;
    },

    _updateTask: function() {
        let calendar = new Calendar.CalClient();
        let taskList = calendar.get_object(GnomeDesktop.CalObjectType.TASK_LIST, "default");
        let taskIterator = taskList.select_objects(GnomeDesktop.CalObjectType.TASK, GnomeDesktop.CalTimeRangeType.DEFAULT, null);
        let currentDate = Math.floor(Date.now() / 1000); // Current Unix timestamp in seconds

        while (taskIterator.next(null)) {
            let task = taskIterator.get_object();
            let taskStartDate = task.get_dtstart();
            let taskEndDate = task.get_dtend();

            if (currentDate >= taskStartDate && currentDate <= taskEndDate) {
                this._label.set_text(task.get_summary());
                break;
            }
        }

        this._timeout = Mainloop.timeout_add_seconds(60, Lang.bind(this, this._updateTask));
    },

    destroy: function() {
        Mainloop.source_remove(this._timeout);
        this.parent();
    }
});

function init() {
    Convenience.initTranslations();
}

function enable() {
    indicator = new CalendarTaskIndicator();
    Main.panel.addToStatusArea('calendar-task-indicator', indicator);
}

function disable() {
    indicator.destroy();
}
