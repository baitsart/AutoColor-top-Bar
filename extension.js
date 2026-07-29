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
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import GdkPixbuf from "gi://GdkPixbuf";

export default class AutoColorTopBarExtension extends Extension {
  enable() {
    this._settings = this.getSettings();

    console.debug("AUTOCOLOR ENABLE");

    this._idleIds = [];

    this._interfaceSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.interface",
    });

    this._backgroundSettings = new Gio.Settings({
      schema_id: "org.gnome.desktop.background",
    });

    // aplicar color inicial desde settings

    this._queueIdle(() => {
      this._applyColor();
      this._applyDashColor();
      this._applyBackgroundColor();
    });

    this._resumeId = Main.layoutManager.connect("monitors-changed", () => {
      this._queueIdle(() => {
        this._applyColor();
      });
    });

    this._settings.connectObject(
      "changed::panel-color",
      () => this._applyColor(),
      this,
    );

    this._settings.connectObject(
      "changed::auto-panel-color",
      () => this._applyColor(),
      this,
    );

    this._settings.connectObject(
      "changed::panel-opacity",
      () => this._applyColor(),
      this,
    );

    this._backgroundSettings.connectObject(
      "changed",
      () => {
        this._queueIdle(() => {
          if (this._settings.get_boolean("auto-panel-color"))
            this._applyColor();

          if (this._settings.get_boolean("auto-dash-color"))
            this._applyDashColor();

          if (this._settings.get_boolean("auto-background-color"))
            this._applyBackgroundColor();
        });
      },
      this,
    );

    this._settings.connectObject(
      "changed::dash-color",
      () => this._applyDashColor(),
      this,
    );

    this._settings.connectObject(
      "changed::auto-dash-color",
      () => this._applyDashColor(),
      this,
    );

    this._settings.connectObject(
      "changed::dash-opacity",
      () => this._applyDashColor(),
      this,
    );

    this._settings.connectObject(
      "changed::background-color",
      () => this._applyBackgroundColor(),
      this,
    );

    this._settings.connectObject(
      "changed::auto-background-color",
      () => this._applyBackgroundColor(),
      this,
    );

    this._dashSettings = this._getDashToDockSettings();

    this._applyDashColor();
    this._applyBackgroundColor();
  }

  disable() {
    this._settings?.disconnectObject(this);
    this._backgroundSettings?.disconnectObject(this);
    this._dashSettings?.disconnectObject(this);

    if (this._resumeId) {
      Main.layoutManager.disconnect(this._resumeId);
      this._resumeId = null;
    }

    for (const id of this._idleIds) {
      GLib.Source.remove(id);
    }
    this._idleIds = [];

    this._settings = null;
    this._backgroundSettings = null;
    this._interfaceSettings = null;
    this._dashSettings = null;

    Main.panel.set_style("");
  }

  _queueIdle(callback) {
    const id = GLib.idle_add(GLib.PRIORITY_DEFAULT, () => {
      this._idleIds = this._idleIds.filter((x) => x !== id);

      callback();

      return GLib.SOURCE_REMOVE;
    });

    this._idleIds.push(id);
  }

  _getAutoColor() {
    const mode = this._interfaceSettings.get_string("color-scheme");

    const key = mode.includes("prefer-dark")
      ? "picture-uri-dark"
      : "picture-uri";

    const uri = this._backgroundSettings.get_string(key);

    if (!uri) throw new Error("No wallpaper URI");

    const file = Gio.File.new_for_uri(uri);
    const path = file.get_path();

    if (!path) {
      throw new Error("Wallpaper is not a local file URI");
    }

    const pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_scale(path, 1, 1, true);

    const pixels = pixbuf.get_pixels();

    const r = pixels[0];
    const g = pixels[1];
    const b = pixels[2];

    return `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  _getDashToDockSettings() {
    const schemaId = "org.gnome.shell.extensions.dash-to-dock";
    const schemaSource = Gio.SettingsSchemaSource.get_default();

    if (schemaSource && schemaSource.lookup(schemaId, true)) {
      return new Gio.Settings({ schema_id: schemaId });
    }

    return null;
  }

  _applyColor() {
    let auto = this._settings.get_boolean("auto-panel-color");

    let color;

    const opacity = this._settings.get_double("panel-opacity");

    if (auto) {
      try {
        color = this._getAutoColor();
      } catch (e) {
        console.debug(`AUTOCOLOR ERROR=${e}`);

        color = "#000000";
      }
    } else {
      // Modo Manual: usar el color del selector
      color = this._settings.get_string("panel-color");
    }

    if (!color) return;

    color = String(color).replace(/['"]/g, "");

    console.debug(`AUTOCOLOR APPLYING ${color}`);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    Main.panel.set_style(
      `background-color: rgba(${r}, ${g}, ${b}, ${opacity});`,
    );
  }

  _applyDashColor() {
    if (!this._dashSettings) return;

    const auto = this._settings.get_boolean("auto-dash-color");
    const opacity = this._settings.get_double("dash-opacity");

    let color;

    if (auto) {
      try {
        color = this._getAutoColor();
      } catch (e) {
        color = "#000000";
      }
    } else {
      color = this._settings.get_string("dash-color");
    }

    if (!color) return;

    color = String(color).replace(/['"]/g, "");

    this._dashSettings.set_boolean("custom-background-color", true);
    this._dashSettings.set_string("background-color", color);
    this._dashSettings.set_double("background-opacity", opacity);
  }

  _applyBackgroundColor() {
    const auto = this._settings.get_boolean("auto-background-color");

    let color;

    if (auto) {
      try {
        color = this._getAutoColor();
      } catch (e) {
        color = "#000000";
      }
    } else {
      color = this._settings.get_string("background-color");
    }

    if (!color) return;

    color = String(color).replace(/['"]/g, "");

    if (this._backgroundSettings.get_string("primary-color") !== color) {
      this._backgroundSettings.set_string("primary-color", color);
    }

    if (this._backgroundSettings.get_string("color-shading-type") !== "solid") {
      this._backgroundSettings.set_string("color-shading-type", "solid");
    }
  }
}
