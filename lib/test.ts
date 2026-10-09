export const questions = [
{icon:'◉',title:'¿Podés frenar cuando lo necesitás?',hint:'En piso plano, sin agarrarte de otra persona.',options:['Todavía no','A veces, pero me cuesta','Sí, de forma controlada']},
{icon:'↗',title:'¿Controlás la dirección?',hint:'Girar y esquivar un obstáculo sin perder el equilibrio.',options:['Me cuesta mantener el rumbo','Hago giros amplios','Giro y esquivo con control']},
{icon:'≋',title:'¿Cómo te va en distintos pisos?',hint:'Juntas, pequeñas irregularidades y cambios de superficie.',options:['Solo practiqué en piso liso','Los paso despacio con ayuda','Los paso sin perder el control']},
{icon:'↘',title:'¿Controlás una pendiente suave?',hint:'Pensá en una situación que ya hayas practicado.',options:['No lo practiqué','Necesito asistencia','Puedo regular la velocidad y frenar']},
{icon:'◷',title:'¿Cuánto podés patinar con comodidad?',hint:'Manteniendo el control, sin llegar al agotamiento.',options:['Menos de 15 minutos','Entre 15 y 40 minutos','Más de 40 minutos']},
{icon:'◇',title:'¿Podés detenerte y seguir al grupo?',hint:'Mantener distancia, escuchar indicaciones y evitar choques.',options:['Necesito apoyo constante','Puedo hacerlo a ritmo tranquilo','Sí, de manera autónoma']},
{icon:'✦',title:'¿Tenés equipo de protección?',hint:'Casco, muñequeras, rodilleras y coderas en buen estado.',options:['Todavía me faltan','Tengo parte del equipo','Tengo todo el equipo']},
{icon:'◈',title:'¿Qué tipo de rollers tenés?',hint:'Elegí la opción que mejor describe tu equipo. Si no sabés, un profe puede ayudarte a identificarlo.',options:['De tela / bota blanda','Extensibles / regulables','Urbanos / bota rígida','No sé qué modelo tengo']},
{icon:'10',title:'¿Ya hiciste más de 10 km continuos sin parar?',hint:'Contá una experiencia real, manteniendo el control y sin terminar agotado.',options:['Todavía no','Hice 10 km o más, pero con pausas','Sí, más de 10 km continuos']},
{icon:'!',title:'Si se te cruza un auto en la calle, ¿cómo resolvés?',hint:'Elegí lo que harías de verdad. No pruebes esta situación en la calle.',options:['Me bloqueo o busco de dónde agarrarme','Intento esquivarlo, pero no sé si podría frenar','Reduzco la velocidad y freno con control, sin asumir que el auto me vio']},
{icon:'Ⅰ',title:'¿Podés mantener el equilibrio en una sola pierna?',hint:'Sobre los rollers, mientras avanzás en piso plano. ¿Podés sostenerlo con ambas piernas por separado?',options:['Todavía no','Solo unos segundos o solo de un lado','Sí, al menos 10 segundos con cada pierna']},
{icon:'⟳',title:'¿Rotaste las ruedas alguna vez?',hint:'Nos ayuda a saber qué mantenimiento necesitás aprender.',options:['Nunca / no sé cómo hacerlo','Alguien las rotó por mí','Sí, sé revisar el desgaste y rotarlas']},
{icon:'⚙',title:'¿Revisaste los tornillos desde que compraste tus rollers?',hint:'Pensá en los ejes de las ruedas y las fijaciones de la guía.',options:['No, nunca los revisé','Los revisé antes, pero no recientemente','Sí, los revisé recientemente o los revisó un técnico']},
{icon:'◈',title:'¿Cuál de estos tres rollers es de bota rígida?',hint:'Mirá las tres imágenes y elegí una respuesta.',options:['El A','El B','El C','Ninguno']}
];
export function evaluate(a:number[]){
 // El tipo de bota y la rotación no otorgan puntos de habilidad.
 const skillIndexes=[0,1,2,3,4,5,8,9,10];
 const score=skillIndexes.reduce((s,i)=>s+(a[i]??0),0);
 const basics=a[0]===2&&a[1]>=1&&a[5]>=1;
 const technique=basics&&a.slice(0,6).every(n=>n===2)&&a[8]===2&&a[9]===2&&a[10]===2;
 const equipment=a[6]===2;
 const maintenance=a[12]===2;
 const urban=technique&&equipment&&maintenance;
 return {score,level:urban?'urbana':basics?'primeros-pasos':'preparacion',equipment,maintenance,wheelHelp:a[11]!==2,unknownRoller:a[7]===3,urbanTechnique:technique,bootKnowledge:a[13]===3};
}
