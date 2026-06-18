import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import Gdk from "gi://Gdk";
import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class AutoColorPrefs extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: _("Auto Color Top Bar"),
    });

    // SWITCH
    const autoSwitch = new Gtk.Switch({
      active: settings.get_boolean("auto-panel-color"),
      valign: Gtk.Align.CENTER,
    });

    autoSwitch.connect("notify::active", () => {
      settings.set_boolean("auto-panel-color", autoSwitch.get_active());
    });

    const autoDashSwitch = new Gtk.Switch({
      active: settings.get_boolean("auto-dash-color"),
      valign: Gtk.Align.CENTER,
    });

    autoDashSwitch.connect("notify::active", () => {
      settings.set_boolean("auto-dash-color", autoDashSwitch.get_active());
    });

    const autoRow = new Adw.ActionRow({
      title: "Auto Panel Color",
    });

    autoRow.add_suffix(autoSwitch);
    group.add(autoRow);

    const autoDashRow = new Adw.ActionRow({
      title: "Auto Dash Color",
    });

    autoDashRow.add_suffix(autoDashSwitch);
    group.add(autoDashRow);

    const autoBackgroundSwitch = new Gtk.Switch({
      active: settings.get_boolean("auto-background-color"),
      valign: Gtk.Align.CENTER,
    });

    autoBackgroundSwitch.connect("notify::active", () => {
      settings.set_boolean(
        "auto-background-color",
        autoBackgroundSwitch.get_active(),
      );
    });

    const autoBackgroundRow = new Adw.ActionRow({
      title: "Auto Background Color",
    });

    autoBackgroundRow.add_suffix(autoBackgroundSwitch);
    group.add(autoBackgroundRow);

    // COLOR PICKER (MANUAL)
    const colorDialog = new Gtk.ColorDialog();

    const colorButton = new Gtk.ColorDialogButton({
      dialog: colorDialog,
      valign: Gtk.Align.CENTER,
    });

    // cargar color guardado
    const savedColor = settings.get_string("panel-color");

    if (savedColor) {
      const rgba = new Gdk.RGBA();
      rgba.parse(savedColor);
      colorButton.set_rgba(rgba);
    }

    const dashColorDialog = new Gtk.ColorDialog();

    const dashColorButton = new Gtk.ColorDialogButton({
      dialog: dashColorDialog,
      valign: Gtk.Align.CENTER,
    });

    // cargar color guardado
    const savedDashColor = settings.get_string("dash-color");

    if (savedDashColor) {
      const rgba = new Gdk.RGBA();
      rgba.parse(savedDashColor);
      dashColorButton.set_rgba(rgba);
    }

    const backgroundColorDialog = new Gtk.ColorDialog();
    const backgroundColorButton = new Gtk.ColorDialogButton({
      dialog: backgroundColorDialog,
      valign: Gtk.Align.CENTER,
    });

    const savedBackgroundColor = settings.get_string("background-color");

    if (savedBackgroundColor) {
      const rgba = new Gdk.RGBA();
      rgba.parse(savedBackgroundColor);
      backgroundColorButton.set_rgba(rgba);
    }

    // guardar solo si NO es auto
    colorButton.connect("notify::rgba", () => {
      if (settings.get_boolean("auto-panel-color")) return;

      const rgba = colorButton.get_rgba();

      const r = Math.round(rgba.red * 255);
      const g = Math.round(rgba.green * 255);
      const b = Math.round(rgba.blue * 255);

      const color =
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");

      settings.set_string("panel-color", color);
    });

    dashColorButton.connect("notify::rgba", () => {
      if (settings.get_boolean("auto-dash-color")) return;

      const rgba = dashColorButton.get_rgba();

      const r = Math.round(rgba.red * 255);
      const g = Math.round(rgba.green * 255);
      const b = Math.round(rgba.blue * 255);

      const color =
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");

      settings.set_string("dash-color", color);
    });

    backgroundColorButton.connect("notify::rgba", () => {
      if (settings.get_boolean("auto-background-color")) return;

      const rgba = backgroundColorButton.get_rgba();

      const r = Math.round(rgba.red * 255);
      const g = Math.round(rgba.green * 255);
      const b = Math.round(rgba.blue * 255);

      const color =
        "#" +
        r.toString(16).padStart(2, "0") +
        g.toString(16).padStart(2, "0") +
        b.toString(16).padStart(2, "0");

      settings.set_string("background-color", color);
    });

    const colorRow = new Adw.ActionRow({
      title: "Panel Color",
    });

    const dashColorRow = new Adw.ActionRow({
      title: "Dash Color",
    });

    dashColorRow.add_suffix(dashColorButton);
    group.add(dashColorRow);

    const backgroundColorRow = new Adw.ActionRow({
      title: "Background Color",
    });

    backgroundColorRow.add_suffix(backgroundColorButton);
    group.add(backgroundColorRow);

    // PANEL OPACITY
    const opacityAdjustment = new Gtk.Adjustment({
      lower: 0.1,
      upper: 1.0,
      step_increment: 0.05,
      value: settings.get_double("panel-opacity"),
    });

    const opacityScale = new Gtk.Scale({
      adjustment: opacityAdjustment,
      digits: 2,
      draw_value: true,
      valign: Gtk.Align.CENTER,
      width_request: 250,
    });

    opacityScale.connect("value-changed", () => {
      settings.set_double("panel-opacity", opacityScale.get_value());
    });

    const opacityRow = new Adw.ActionRow({
      title: "Panel Transparency",
    });

    opacityRow.add_suffix(opacityScale);
    group.add(opacityRow);

    // DASH OPACITY
    const dashOpacityAdjustment = new Gtk.Adjustment({
      lower: 0.1,
      upper: 1.0,
      step_increment: 0.05,
      value: settings.get_double("dash-opacity"),
    });

    const dashOpacityScale = new Gtk.Scale({
      adjustment: dashOpacityAdjustment,
      digits: 2,
      draw_value: true,
      valign: Gtk.Align.CENTER,
      width_request: 250,
    });

    dashOpacityScale.connect("value-changed", () => {
      settings.set_double("dash-opacity", dashOpacityScale.get_value());
    });

    const dashOpacityRow = new Adw.ActionRow({
      title: "Dash Transparency",
    });

    dashOpacityRow.add_suffix(dashOpacityScale);
    group.add(dashOpacityRow);

    colorRow.add_suffix(colorButton);
    group.add(colorRow);

    page.add(group);
    window.add(page);
  }
}
