# Verkefnalisti - Hópaverkefni 2, Vefforritun 2

## Um verkefnið

Verkefnalisti er vefforrit sem gerir notendum kleift að halda utan um verkefni sín á skipulagðan og skilvirkan hátt. Forritið býður upp á möguleika á að búa til, breyta, eyða og merkja verkefni sem lokið, auk þess að flokka þau eftir flokkum og merkjum (tags).

## Takmarkanir og áskoranir

Þetta verkefni byggir á fyrri skilum (hópverkefni 1) sem bakenda. Ég lenti í nokkrum áskorunum:

- Bakendinn var ekki fullkominn og sum API köll virkuðu ekki eins og búist var við
- Mynda virkni var ekki hluti af upprunalega bakendanum og þurfti að bæta því við
- Cloudinary upphleðsla krafðist sérsniðins kóða til að virka með Next.js
- Ýmis smáatriði og villur í upprunalega bakendanum þurftu sérstaka meðhöndlun

Til að leysa þessar áskoranir:
- Ég innleiddi "fallback" á mock bakenda þegar raunverulegi bakendinn virkar ekki
- Setti upp beina tengingu við Cloudinary API fyrir mynda virkni
- Bætti við villutilkynningum og loading state á viðmótið

## Virkni

### Aðalvirkni
- **Skoða verkefni**: Sjá öll verkefni á einum stað með síðuskiptingu
- **Bæta við verkefnum**: Búa til ný verkefni með titli, lýsingu, lokadegi og fleiri upplýsingum
- **Breyta verkefnum**: Uppfæra upplýsingar um verkefni
- **Eyða verkefnum**: Fjarlægja verkefni sem ekki eru lengur viðeigandi
- **Merkja verkefni sem lokið**: Halda utan um framvindu verkefna

### Flokkun og síun
- **Flokkar**: Skipuleggja verkefni eftir flokkum
- **Tags**: Bæta við merkjum við verkefni til að auðvelda leit
- **Síun**: Sía verkefni eftir stöðu, flokkum og merkjum

### Notendavirkni
- **Innskráning**: Notendur geta skráð sig inn
- **Nýskráning**: Notendur geta búið til aðgang
- **Stjórnendaaðgangur**: Sér virkni fyrir stjórnendur

## Tæknistakur

Verkefnið er byggt upp með:
- **Next.js**: App Router (server-side rendering)
- **TypeScript**: Fyrir týpuvörn og þróun
- **Tailwind CSS**: Fyrir útlit og responsive hönnun
- **Cloudinary**: Fyrir mynda virkni og geymslu
- **Mock API**: Fyrir prófun án bakenda

## Uppsetning verkefnis

### Nauðsynlegar forsendur
- Node.js (útgáfa 18 eða nýrri)
- npm (fylgir með Node.js)

### Uppsetning
```bash
npm install
```

### Keyra verkefnið
```bash
npm run dev
```

### Innskráningarupplýsingar 
- **Stjórnandi**: notandanafn: `admin`, lykilorð: `admin`
- **Almennur notandi**: notandanafn: `user`, lykilorð: `user`

## Vinna að verkefninu

Verkefnið var unnið í þrepum:

1. Fyrst var settur upp grunnstrúktúr með Next.js og TypeScript
2. Síðan var útfærð notendavirkni með innskráningu og nýskráningu
3. Verkefnalisti og verkefnasíður voru útfærðar með tengingum við bakenda
4. Þegar kom í ljós að sumar aðgerðir virkuðu ekki í bakendanum var bætt við mock virkni
5. Cloudinary var tengt við verkefnið fyrir mynda virkni
6. Að lokum var unnið í útliti og notendaupplifun

## Vandamál og lærdómur

Nokkur atriði sem ég lenti í vandræðum með:

- **Cross-Origin Resource Sharing (CORS)**: Vandamál með að tala við bakendann
- **API samræmi**: Svör frá bakenda voru ekki alltaf á sama formi
- **Next.js server components vs client components**: Læra þurfti hvenær á að nota hvort
- **Cloudinary undirritun**: Vinna með undirritaða og óundirritaða upphleðslu
- **Loading states**: Hanna notendaviðmót sem sýnir rétt loading ástand

Lærdómurinn var mikill, sérstaklega varðandi:
- Hvernig á að hanna góða notendaupplifun þrátt fyrir takmarkaðan bakenda
- Hvernig á að smíða robust frontend sem getur unnið með ófullkomnum bakenda
- Forritunarmynstur fyrir React og Next.js

## Höfundur
Verkefnið var unnið af Mána sem hópaverkefni 2 í Vefforritun 2 við Háskóla Íslands vorið 2025.