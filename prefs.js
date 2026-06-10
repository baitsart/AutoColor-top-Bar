import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AutoColorPrefs extends ExtensionPreferences {

    fillPreferencesWindow(window) {

        const settings = this.getSettings('org.gnome.shell.extensions.AutoColorTopBar');

        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: _('Auto Color Top Bar'),
        });

        // SWITCH
        const autoSwitch = new Gtk.Switch({
            active: settings.get_boolean('auto-color')
        });

        autoSwitch.connect('notify::active', () => {
            settings.set_boolean(
                'auto-color',
                autoSwitch.get_active()
            );
        });

        const autoRow = new Adw.ActionRow({
            title: 'Auto Color'
        });

        autoRow.add_suffix(autoSwitch);
        group.add(autoRow);

        // COLOR PICKER (MANUAL)
        const colorDialog = new Gtk.ColorDialog();
        
        const colorButton = new Gtk.ColorDialogButton({
            dialog: colorDialog,
            valign: Gtk.Align.CENTER
        });
        
        // cargar color guardado
        const savedColor = settings.get_string('color');
        
        if (savedColor) {
            const rgba = new Gdk.RGBA();
            rgba.parse(savedColor);
            colorButton.set_rgba(rgba);
        }
        
        // guardar solo si NO es auto
        colorButton.connect('notify::rgba', () => {
        
            if (settings.get_boolean('auto-color'))
                return;
        
            const rgba = colorButton.get_rgba();
        
            const r = Math.round(rgba.red * 255);
            const g = Math.round(rgba.green * 255);
            const b = Math.round(rgba.blue * 255);
        
            const color =
                '#' +
                r.toString(16).padStart(2, '0') +
                g.toString(16).padStart(2, '0') +
                b.toString(16).padStart(2, '0');
        
            settings.set_string('color', color);
        });
        
        const colorRow = new Adw.ActionRow({
            title: 'Manual Color'
        });
        
        colorRow.add_suffix(colorButton);
        group.add(colorRow);

        page.add(group);
        window.add(page);
    }
}
