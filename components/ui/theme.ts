import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";

export const AppLightTheme = {
    ...NavigationDefaultTheme,
    colors: {
        ...NavigationDefaultTheme.colors,
        background: "#312C51",
        backgroundTabs: "#2b2648ff",
        accent: " #F1AA9B",

        card: "#48426D",
        primary: "#F0C38E",
        secondary: "#F1AA9B",

        textPrimary: "#FFFFFF",
        textSecondary: "#D1CFE2",

        border: "rgba(255,255,255,0.08)",
    },
};

export const AppDarkTheme = {
    ...NavigationDarkTheme,
    colors: {
        ...NavigationDarkTheme.colors,
        background: "#312C51",
        backgroundTabs: "#2b2648ff",
        accent: " #F1AA9B",

        card: "#48426D",
        primary: "#F0C38E",
        secondary: "#F1AA9B",

        textPrimary: "#FFFFFF",
        textSecondary: "#D1CFE2",

        border: "rgba(255,255,255,0.08)",
    },
};
