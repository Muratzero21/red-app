with open('app/(tabs)/trailers.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace("import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';", "")
text = text.replace("const tabBarHeight = useBottomTabBarHeight();\n  const containerHeight = height - tabBarHeight;", "const containerHeight = height - 90;")
text = text.replace("THEME.colors.primary", "THEME.colors.red")
text = text.replace('weight="black"', 'weight="bold"')

with open('app/(tabs)/trailers.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed')
