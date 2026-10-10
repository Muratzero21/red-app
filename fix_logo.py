with open('app/(tabs)/trailers.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

logic = """  const videos = details?.videos?.results || [];
  const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') || videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
  const logos = details?.images?.logos || [];
  const logo = logos.length > 0 ? logos[0].file_path : null;"""

text = text.replace("  const videos = details?.videos?.results || [];\n  const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'en') || videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];", logic)

render_target = '<REDText style={styles.title} weight="bold">{item.title}</REDText>'
render_logo = """{logo ? (
          <Image 
            source={{ uri: getImageUrl(logo, 'w500') }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <REDText style={styles.title} weight="bold">{item.title}</REDText>
        )}"""

text = text.replace(render_target, render_logo)

style_target = "  title: {\n    fontSize: 22,\n    marginBottom: 8,\n  },"
style_new = "  title: {\n    fontSize: 22,\n    marginBottom: 8,\n  },\n  logoImage: {\n    width: 200,\n    height: 70,\n    marginBottom: 16,\n  },"

text = text.replace(style_target, style_new)

with open('app/(tabs)/trailers.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print('Added logos')
