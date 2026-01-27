import os
import re

TIMELINE_DIR = r"d:\dev\shi\src\content\timeline"

KEYWORDS = {
    'skull': ['muerte', 'asesinato', 'fallecimiento', 'ejecución', 'ejecucion', 'matanza', 'sacrificio', 'suicidio'],
    'battle': ['batalla', 'guerra', 'ataque', 'combate', 'derrota', 'golpe', 'asedio', 'conflicto', 'rebelión', 'rebelion', 'invasión', 'invasion', 'lucha', 'enfrentamiento', 'destrucción'],
    'magic': ['hechizo', 'magia', 'mago', 'bruja', 'ritual', 'demonio', 'sobrenatural', 'maldición', 'maldicion', 'arcano', 'dios', 'espíritu', 'espiritu', 'fantasma', 'vampiro', 'ocultismo', 'místico', 'mistico', 'profecía', 'profecia'],
    'tech': ['tecnología', 'tecnologia', 'científico', 'cientifico', 'base', 'experimento', 'nave', 'robot', 'ia', 'cibernético', 'cibernetico', 'suero', 'vacuna', 'estación', 'estacion', 'laboratorio', 'nuclear', 'digital', 'virus', 'tecnomante'],
    'shield': ['fundación', 'fundacion', 'creación', 'creacion', 'organización', 'organizacion', 'grupo', 'equipo', 'agencia', 'gobierno', 'ley', 'decreto', 'orden', 'institución', 'institucion', 'fbi', 'cia', 'policía', 'policia', 'ejército', 'ejercito'],
    'deal': ['tratado', 'pacto', 'alianza', 'acuerdo', 'diplomacia', 'unión', 'union', 'negociación', 'tregua'],
    'portal': ['portal', 'brecha', 'dimensión', 'dimension', 'llegada', 'aparición', 'aparicion', 'desaparición', 'desaparicion', 'viaje', 'retorno', 'origen', 'cruce', 'vórtice', 'transportado'],
    'character': ['nacimiento', 'boda', 'retiro', 'vida', 'biografía', 'biografia', 'infancia', 'juventud', 'padres', 'hijo', 'hija', 'bautizo']
}

PRIORITY = ['skull', 'battle', 'portal', 'deal', 'magic', 'tech', 'shield', 'character', 'star']

def get_icon(text):
    text = text.lower()
    scores = {key: 0 for key in KEYWORDS}
    
    for icon, words in KEYWORDS.items():
        for word in words:
            if word in text:
                scores[icon] += 1
                
    # Find max score
    max_score = 0
    best_icons = []
    
    for icon, score in scores.items():
        if score > max_score:
            max_score = score
            best_icons = [icon]
        elif score == max_score and score > 0:
            best_icons.append(icon)
            
    if not best_icons:
        return 'star' # Default
        
    # If tie, use priority
    for p in PRIORITY:
        if p in best_icons:
            return p
            
    return best_icons[0]

def process_files(dry_run=True):
    for filename in os.listdir(TIMELINE_DIR):
        if not filename.endswith(".md"):
            continue
            
        filepath = os.path.join(TIMELINE_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Parse frontmatter
            match = re.match(r'^---\s+(.*?)\s+---', content, re.DOTALL)
            if not match:
                continue
                
            frontmatter = match.group(1)
            
            # Extract fields for analysis
            title_match = re.search(r'title:\s*"(.*?)"', frontmatter)
            desc_match = re.search(r'description:\s*"(.*?)"', frontmatter)
            
            title = title_match.group(1) if title_match else ""
            desc = desc_match.group(1) if desc_match else ""
            
            full_text = f"{title} {desc}"
            new_icon = get_icon(full_text)
            
            # Check existing icon
            icon_match = re.search(r'icon:\s*"(.*?)"', frontmatter)
            current_icon = icon_match.group(1) if icon_match else "star"
            
            if new_icon != current_icon and new_icon != 'star':
                print(f"File: {filename}")
                print(f"  Text: {full_text[:50]}...")
                print(f"  Change: {current_icon} -> {new_icon}")
                
                if not dry_run:
                    if icon_match:
                        new_content = content.replace(f'icon: "{current_icon}"', f'icon: "{new_icon}"')
                    else:
                        # Add icon if missing (after reality)
                        if 'reality:' in content:
                           new_content = content.replace('reality:', f'icon: "{new_icon}"\nreality:')
                        else:
                           # Append to end of frontmatter
                           new_content = content.replace('---', f'icon: "{new_icon}"\n---', 1) 
                           # Wait, replace first occurrences ends the frontmatter block, need to be careful.
                           # Safest is regex replace of the icon line if exists, or insert.
                           pass

                    # Better replacement logic
                    if icon_match:
                        new_content = re.sub(r'icon:\s*".*?"', f'icon: "{new_icon}"', content)
                    else:
                        # Insert before the last ---
                        new_content = re.sub(r'(---\s*$)', f'icon: "{new_icon}"\n\\1', content, flags=re.MULTILINE)

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    # print("--- DRY RUN ---")
    process_files(dry_run=False)
    # print("--- COMPLETED ---")
