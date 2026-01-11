<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="es">
      <head>
        <title>Superhéroes INC. Blog RSS</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            font-size: 16px;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
            background-color: #f6f6f6;
          }
          header {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 { margin: 0 0 0.5rem; color: #d0021b; }
          p.subtitle { color: #666; margin: 0; }
          a { color: #d0021b; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .item {
            background: white;
            padding: 2rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .item h2 { margin: 0 0 0.5rem; }
          .item-meta { font-size: 0.9rem; color: #666; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <header>
          <h1>Superhéroes INC. Blog</h1>
          <p class="subtitle">Feed RSS de noticias y artículos</p>
          <p><a href="/">← Volver a la web</a></p>
        </header>
        <main>
          <xsl:for-each select="/rss/channel/item">
            <article class="item">
              <h2>
                <a href="{link}" target="_blank">
                  <xsl:value-of select="title"/>
                </a>
              </h2>
              <div class="item-meta">
                Publicado el <xsl:value-of select="pubDate"/>
              </div>
              <div>
                <xsl:value-of select="description"/>
              </div>
            </article>
          </xsl:for-each>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
