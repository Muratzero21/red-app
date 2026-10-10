import re
with open('app/(tabs)/_layout.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

if 'Film' not in text:
    text = re.sub(r'import \{ (.*?) \} from \'lucide-react-native\';', r'import { \1, Film } from \'lucide-react-native\';', text)

trailer_tab = """      <Tabs.Screen
        name="trailers"
        options={{
          title: 'Shorts',
          tabBarIcon: ({ color, size }) => <Film size={size} color={color} strokeWidth={2.5} />,
        }}
      />\n"""

text = text.replace('      <Tabs.Screen\n        name="watchlist"', trailer_tab + '      <Tabs.Screen\n        name="watchlist"')

with open('app/(tabs)/_layout.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Done layout')
