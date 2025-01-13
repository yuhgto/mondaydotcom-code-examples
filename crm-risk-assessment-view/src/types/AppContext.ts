export interface GenericContext {
  themeConfig: ThemeConfig | undefined;
  boardId: number;
  boardIds?: number[] | null;
  boardViewId: number;
  viewMode: ViewMode;
  instanceId: number;
  instanceType: string;
  workspaceId: number;
  theme: Theme;
  account: Account;
  user: User;
  region: string;
  app: App;
  appVersion: AppVersion;
  appFeature: {
    name: string;
    type: string;
  };
}

export interface BoardViewContext {
  themeConfig: ThemeConfig | undefined;
  boardId: number;
  boardIds?: number[] | null;
  boardViewId: number;
  viewMode: ViewMode;
  instanceId: number;
  instanceType: string;
  workspaceId: number;
  theme: Theme;
  account: Account;
  user: User;
  region: string;
  app: App;
  appVersion: AppVersion;
  appFeature: {
    name: string;
    type: "AppFeatureBoardView";
  };
}

export interface DashboardWidgetContext {
    themeConfig: ThemeConfig | undefined;
    boardIds?: number[] | null;
    widgetId: number;
    viewMode: ViewMode;
    editMode: boolean;
    instanceId: number;
    instanceType: string;
    theme: Theme;
    account: Account;
    user: User;
    region: string;
    app: App;
    appVersion: AppVersion;
    appFeature: {
      name: string;
      type: "AppFeatureDashboardWidget"
    };  
}

export type ViewMode = "fullScreen" | "split" | "widget";

export interface ThemeConfig {
  name: string;
  colors: Colors;
}

export type Theme = "light" | "dark" | "black" | string;

export interface Colors {
  light: ColorTheme;
  dark: ColorTheme;
  black: ColorTheme;
}
export interface ColorTheme {
  "primary-color": string;
  "primary-hover-color": string;
  "primary-selected-color": string;
  "primary-selected-hover-color": string;
  "brand-colors": BrandColors;
}
export interface BrandColors {
  "brand-color": string;
  "brand-hover-color": string;
  "text-color-on-brand": string;
}
export interface Account {
  id: string;
}
export interface User {
  id: string;
  isAdmin: boolean;
  isGuest: boolean;
  isViewOnly: boolean;
  countryCode: string;
  currentLanguage: string;
  timeFormat: "12H" | "24H";
  timeZoneOffset: number;
}
export interface App {
  id: number;
  clientId: string;
}
export interface AppVersion {
  id: number;
  name: string;
  status: string;
  type: string;
  versionData: VersionData;
}
export interface VersionData {
  major: number;
  minor: number;
  patch: number;
  type: string;
}
export interface AppFeature {
  type: "AppFeatureDashboardWidget" | "AppFeatureBoardView" | string;
  name: string;
}
