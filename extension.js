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
}
    disable() {

        Main.panel.set_style("");
    }

_applyColor() {

    let auto = this._settings.get_boolean('auto-color');

    let color;

    if (auto) {
    
        // Modo Auto: leer el color desde el archivo de Clementine
        try {
    
            const path = GLib.build_filenamev([
                GLib.get_home_dir(),
                '.config',
                'Clementine',
                'color_background'
            ]);
    
            const [, contents] = GLib.file_get_contents(path);
    
            color = new TextDecoder().decode(contents).trim();
    
        } catch (e) {
    
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
        `background-color: rgba(${r}, ${g}, ${b}, 0.60);`
    );
}
}

