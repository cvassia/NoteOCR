import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from "../../components/colors";


export default function TabLayout() {
  // const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarStyle: {
          height: 85,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: Colors.backgroundTabs,
          borderTopWidth: 0,
          elevation: 0,
        },

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#A9A4C7",
        tabBarIconStyle: {
          marginBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />

    </Tabs>
  );
}
