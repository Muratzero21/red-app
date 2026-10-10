import os, glob

for filepath in glob.glob('**/*.tsx', recursive=True) + glob.glob('**/*.ts', recursive=True):
    if 'node_modules' in filepath: continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
        
    changed = False
    if 'absoluteFillObject' in text:
        text = text.replace('absoluteFillObject', 'absoluteFill')
        changed = True
        print(f'Fixed absoluteFill in {filepath}')

    if 'weight="medium"' in text:
        text = text.replace('weight="medium"', 'weight="semibold"')
        changed = True
        print(f'Fixed weight medium in {filepath}')

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
