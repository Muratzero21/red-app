with open('app/(tabs)/trailers.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target = "const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];"
replacement = "const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') || videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];"

text = text.replace(target, replacement)

with open('app/(tabs)/trailers.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed trailer lang')
