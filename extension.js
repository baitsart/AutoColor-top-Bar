/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import GdkPixbuf from 'gi://GdkPixbuf';

export default class AutoColorTopBarExtension extends Extension {

enable() {

    this._settings = this.getSettings();

    log("AUTOCOLOR ENABLE");

    // aplicar color inicial desde settings
    this._applyColor();



    // escuchar cambios en tiempo real (prefs.js)
    this._settings.connect('changed::color', () => {
        this._applyColor();
    });
    
    this._settings.connect('changed::auto-color', () => {
        this._applyColor();
    });


    this._backgroundSettings = new Gio.Settings({
        schema_id: 'org.gnome.desktop.background'
    });
    
    this._backgroundSettings.connect('changed', () => {
    
        if (this._settings.get_boolean('auto-color'))
            this._applyColor();
    
    });
    
}

    disable() {

        Main.panel.set_style("");

    }
        
        _getAutoColor() {
        
           const backgroundSettings = new Gio.Settings({
               schema_id: 'org.gnome.desktop.background'
           });
           
           const interfaceSettings = new Gio.Settings({
               schema_id: 'org.gnome.desktop.interface'
           });
           
           const mode = interfaceSettings.get_string('color-scheme');
           
           const key = mode.includes('prefer-dark')
               ? 'picture-uri-dark'
               : 'picture-uri';
           
           const uri = backgroundSettings.get_string(key);
           
           log(`AUTOCOLOR URI=${uri}`);
        
            const file = Gio.File.new_for_uri(uri);
            
            log(`AUTOCOLOR PATH=${file.get_path()}`);
        
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(
                file.get_path(),
                1,
                1,
                true
            );
        
            const pixels = pixbuf.get_pixels();
        
            const r = pixels[0];
            const g = pixels[1];
            const b = pixels[2];
            
            log(`AUTOCOLOR RGB=${r},${g},${b}`);

            const hex =
                `#${r.toString(16).padStart(2, '0')}` +
                `${g.toString(16).padStart(2, '0')}` +
                `${b.toString(16).padStart(2, '0')}`;
            
            log(`AUTOCOLOR HEX=${hex}`);
            
            return hex;
        
        }
        

_applyColor() {

    let auto = this._settings.get_boolean('auto-color');

    let color;

    if (auto) {
    
        try {
    
            color = this._getAutoColor();
    
        } catch (e) {
    
            log(`AUTOCOLOR ERROR=${e}`);
    
            color = '#000000';
        }
    
    } else {
    
        // Modo Manual: usar el color del selector
        color = this._settings.get_string('color');
    }

    if (!color)
        return;

    color = String(color).replace(/['"]/g, '');
    
    log(`AUTOCOLOR APPLYING ${color}`);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    Main.panel.set_style(
            `background-color: rgb(${r}, ${g}, ${b});`

    );
}
}

