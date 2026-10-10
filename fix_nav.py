with open('src/components/ui/TopNavBar.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

import re

old_image = re.search(r'<Image[\s\S]*?/>', text).group(0)
new_image = '{title ? <REDText weight="bold" size={24}>{title}</REDText> : ' + old_image + '}'
text = text.replace(old_image, new_image)

if 'REDText' not in text:
    text = text.replace('import { BlurView }', 'import { REDText } from \'./REDText\';\nimport { BlurView }')

with open('src/components/ui/TopNavBar.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Updated TopNavBar render logic')
