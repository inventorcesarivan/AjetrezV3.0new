
Instrucciones para Simple y Amenaza
1) Sube a tu sitio:
   - /web/online.js  (cliente base)
   - /web/online_attach_simple.js
   - /web/online_attach_amenaza.js
2) En cada HTML (simple / amenaza), agrega antes de </body>:
   <script type="module" src="./web/online_attach_simple.js"></script>   <!-- en modo simple -->
   <script type="module" src="./web/online_attach_amenaza.js"></script>  <!-- en modo amenaza -->
Listo: los scripts insertan el botón y el pill automáticamente y conectan a Supabase.
