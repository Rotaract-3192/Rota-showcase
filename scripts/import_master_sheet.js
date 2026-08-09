const { Client } = require('pg');

const dbUrl = "postgresql://postgres.your-tenant-id:babe728a8ce40f6a996084f51e06a6a0ee6d6e338c5629f75bef216ec93e9463@db.rotaract3192.org:5432/postgres?sslmode=disable";

const rawData = `
1
Rotaract Bangalore West
Community Based
rbw.president@gmail.com
Bangalore West
Rtr. Neeraj R
President
8105202299
neeraj11032007@gmail.com
Rtr. Dhruti V Wadki
Secretary
9483267153
secretaryrbw.2425@gmail.com
2
Rotaract Club of Acharya Bangalore B School
Institution Based
rotaract@abbs.edu.in
Bangalore Brigades
Rtr. Aditya Singh
President
8388067734
singhaditya44452@gmail.com
Rtr. Jyothika V Nair
Secretary- Administration
9495995858
jyothika.nair006@gmail.com
Rtr. Sangeetha Priya B
Secretary- Operations
9148763040
sangeethapriyab23@gmail.com
3
Rotaract Club of Aditya Institute of Management Studies
Institution Based
aimsrotaract202411@gmail.com
Bangalore Yelahanka
4
Rotaract Club of Agragami Degree College
Institution Based
agragamirotaractclub@gmail.com
Bangalore Yelahanka
5
Rotaract Club of AIMIT College
Institution Based
aimitrotaract@gmail.com
Bangalore West
6
Rotaract Club of AIMS Institute of Higher Education
Institution Based
rotaract@theaims.ac.in, Rotaractclubofaims@gmail.com,Secretariatracaims08@gmail.com
Bangalore Udyog
Rtr. Sanskriti
President
9035563115
rtrsanskritibabrekar@gmail.com
Rtr. Kevin Regan Prasad
Vice President
9880617159
Rtr. Smitesh
Secretary- Administration
6361370150
rtrsmiteshotavanekar@gmail.com
Rtr. Geethika R
Secretary- Operations
7019433572
rgeethika90@gmail.com
7
Rotaract Club of Ambedkar Institute of Technology
Institution Based
rotaractdrait@gmail.com
Bangalore Sadgamaya
8
Rotaract Club of Baldwin Women's Methodist College
Institution Based
Bwmc.edu.in
Bangalore Brigades
9
Rotaract Club of Bangalore
Community Based
rotaractclubofbangalore.058@gmail.com
Bangalore
Rtr. Veekshitha K Girish
President
8660292945
Veekshitha.kg2002@gmail.com
PDIR Rtr. Tanmay M Jain
Vice President
8431567935
tanmay11pthjain@gmail.com
Rtr. Aarna R Gupta
Secretary- Administration
7795030543
aarnargupta28@gmail.com
Rtr. Mohammed Siddique
Secretary- Operations
8296061970
mohammedsiddique0307@gmail.com
Rtr. Nandini Vikram
Secretary- Initiatives
7019587900
nandininandu4765@gmail.com
Rtr. Shriya Prabhu
Joint Secretary
9740492728
shriya.praabhu@gmail.com
10
Rotaract Club of Bangalore Basaveshwaranagar
Community Based
rotaractcb2@gmail.com
Bengaluru Basaveshwaranagar
Rtr. Architha S
President
8711864768
11
Rotaract Club of Bangalore Bhuvaneshwari Nagar
Community Based
racbbhuvaneshwarinagar@gmail.com
Bangalore Bhuvaneshwarinagar
Rtr. Someshwara H C
President
7676688379
someshwarahc@gmail.com
12
Rotaract Club of Bangalore Golden Rock
Community Based
rotaractbangaloregoldenrock@gmail.com
Bangalore Brigades
Rtr. Shishira Urs
President
8217393709
shishiraurs28@gmail.com
IPP Rtr. Rahul Kumar
Secretary- Administration
9980588430
iamrahulvkumar@gmail.com
Rtr. Chandan Jayavithal Kubal
Secretary- Operations
7676475931
13
Rotaract Club of Bangalore Indiranagar
Community Based
Rotaractindiranagar@gmail.com
Bangalore Indiranagar
Rtr. Gaurav Rungta
President
8123800642
gauravrungta123@gmail.com
Rtr. Furquaan M
Secretary
9480017396
Rtr. Sunanda Nahar
Joint Secretary
9148021111
14
Rotaract Club of Bangalore Junction
Community Based
rotaractbangalorejunction@gmail.com
Bangalore Junction
15
Rotaract Club of Bangalore Nandini
Community Based
rotaract@rotarybangalorenandini.org
Bangalore Nandini
Rtr. Kavya Girish
President
8217899659
Rtr. Sharangi
Secretary
9741176715
Rtr. Lopamudra G
Secretary
6362462277
16
Rotaract Club of Bangalore North West
Community Based
rcbnw3190@gmail.com
Bangalore North West
Rtr. Jyothi Anand
President
9108382005
rtrjyothianand1905@gmail.com
Rtr. Bhanu Kashyap
Vice President
6363973177
kashyapbhanu392@gmail.com
Rtr. Veerendra Srinivas MV
Secretary
8884164529
veerendrasrinivasmv@gmail.com
17
Rotaract Club of Bangalore Oasis
Community Based
rotaractclubofbangaloreoasis@gmail.com
Bangalore Oasis
Rtr. Rtn. Vivek Trivedi
President
6200152182
thevivektrivedi31@gmail.com
Rtr. Abhinav A S
Secretary
9980100731
underabhi7@gmail.com
Rtr. Yogesh N Reddy
Secretary
9108899225
vnreddy.y56@gmail.com
18
Rotaract Club of Bangalore R.T. Nagar
Community Based
rotaractblrrtnagar@gmail.com
Bangalore R.T. Nagar
19
Rotaract Club of Bangalore Raj Mahal Vilas
Community Based
rotaractclubrmv17@gmail.com
Bangalore Raj Mahal Viilas
Rtr. Rtn. Jyothsna Ram P
President
7019550470
rtrjyothsna2811@gmail.com
Rtr. Syeda Kounain
Vice President
80504 66988
syedakounain381@gmail.com
Rtr. Nandan M
Secretary
8867031886
nandanreddy871@gmail.com
Rtr. Sairaksha Sriram
Secretary
7019879832
sairaksha.sriram@gmail.com
20
Rotaract Club of Bangalore Udyog
Community Based
rbu3192@gmail.com
Bangalore Udyog
Rtr. Tharun M
President
9513435863
tharunm0910@gmail.com
Rtr. Aditya Deepak Mudur
Vice President
Rtr. Sahana R
Secretary
9972058854
sahanaraju.14@gmail.com
Rtr. Vageesha Theertha C
Secretary
9036332538
vageeshatheerthac@gmail.com
21
Rotaract Club of Bangalore Warriors
Community Based
racwarriors2023@gmail.com
Bengaluru Manyata
Rtr. Rishabh Gupta
President
8884669102
p.nrishabh24@gmail.com
Rtr. Shreya S
Vice President
9740669949
shreyaasathishh@gmail.com
Rtr. Anisha Ravichandran
Secretary- Administration
8861046666
anirav2006@gmail.com
Rtr. Guru Raghav
Secretary- Operations
6369444211
gururaghavofficial@gmail.com
22
Rotaract Club of Bengaluru Avinya
Community Based
racbengaluruavinya@gmail.com
Bangalore Brigades
23
Rotaract Club of Bengaluru Compassion Crew
Community Based
bengalurucompassioncrew@gmail.com
Platinum city
24
Rotaract Club of Bengaluru Nagasandra
Community Based
rcbn.club@gmail.com
Bangalore Udyog
Rtr. Keerthana Ashok
President
8618267077
keerthanashk@gmail.com
Rtr. Shashantha N
Vice President
8197413368
Shashantha14@gmail.com
PP. Rtr. Rtn. Rohith S
Secretary- Administration
9606254887
pp.rtr.rohith@gmail.com
Rtr. Jayachandra Patel
Secretary- Operations
8310143600
jayachandra201003@gmail.com
Rtr. Rohith Gowda T D
Secretary- Communications
7619265347
rohith.gowda0109@gmail.com
25
Rotaract Club of Bengaluru Nava Chaitanya
Community Based
racnavachaitanya3192@gmail.com
Rotaract Swarna Bengaluru
Rtr. Srrivatsa
President
8951425967
rtr.srrivatsa@gmail.com
Rtr. Disha Jain
Vice President
9535325413
Dinujain2002@gmail.com
Rtr. Nayana G
Secretary
9606375305
26
Rotaract Club of Bengaluru Orion Gateway
Community Based
rog.3192@gmail.com
Bengaluru Orion Gateway
Rtr. Mohith D K
President
8431364094
mohithdk03@gmail.com
Rtr. Bhavyashree
Vice President
8088796041
Rtr. Shravanthi M
Secretary- Administration
9141106738
magalashravanthi@gmail.com
Rtr. Keerthi Reddy
Secretary Operations
9513783314
palagirikeerthireddy04@gmail.com
27
Rotaract Club of Bishop Cotton Yelahanka
Institution Based
rotractbcapm2021@gmail.com
Bangalore Yelahanka
28
Rotaract Club of BMS Yelahanka
Institution Based
rcbmsy@bmsit.in
Bangalore Yelahanka
Rtr. Deona Braganza
President
7022302202
deonabraganza@gmail.com
Rtr. Pranathi Girimaji
Vice President
9632030825
24ug1byec017@bmsit.in
Rtr. Nidhish J B
Secretary- Administration
9481292847
jbnidhish0@gmail.com
Rtr. Aditya Jamane
Joint Secretary
9482653456
adityajamane16@gmail.com
29
Rotaract Club of BNM Institute of Technology
Institution Based
bnmit.rotaract@gmail.com
Bangalore Mahalakshmi Central
30
Rotaract Club of CMRIT
Institution Based
rc.cmrit@cmrit.ac.in
Bangalore Ramamurthy Nagar
Rtr. Chinmaya R Bhat
President
8095551444
Chinmayarbhat@gmail.com
Rtr. Devanandu V
Secretary
6362144717
devananduv7@gmail.com
31
Rotaract Club of Charan's Degree College
Institution Based
rotractclubcharansdegreecollege@gmail.com
Bangalore Ulsoor
Rtr. Rohini
President
8088640339
rohiniroo19@gmail.com
Rtr. Shwetha V
Secretary
7349504906
swethavelmurugan91@gmail.com
32
Rotaract Club of Christ University Bangalore Yeshwanthpur Campus
Institution Based
rotaractclub.byc@christuniversity.in
Bangalore Udyog
Rtr. Vinamra Hari Agarwal
President
9078002789
vinamra.hari@bbah.christuniversity.in
Rtr. Khanak Rahul Agarwal
Vice President
9227915999
khanak.rahul@bbah.christuniversity.in
Rtr. Joliza Fatima Dias
Secretary
9075990087
jolizadias02@gmail.com
Rtr. Aruna Bakhtiyar
Jt Secretary
7509975088
aruna.bakhtiyar@bbah.christuniversity.in
33
Rotaract Club of Christ University Bannerghatta Road Campus
Institution Based
rotaract.brc@christuniversity.in
Bangalore North West
Rtr. Sharone Sahu
President
9938096522
sharone.sahu@bscpsyh.christuniversity.in
Rtr. Akhilandeshwari E S
Vice President
6381826911
akilandeshwari.es@bscpsyh.christuniversity.in
Rtr. Kshama Shetty
Secretary
7447462007
imkshamasshetty@gmail.com
34
Rotaract Club of Christ University Central Campus
Institution Based
thcl@christuniversity.in
Bangalore North West
Rtr. Nivedha P R
President
8098798680
nivedha.pr@bcomifh.christuniversity.in
35
Rotaract Club of Christ University Kengeri Campus
Institution Based
rotaract.kengeri@psyh.christuniversity.in
Bangalore North West
Rtr. Mishti Singhal
President
8107999368
mishti.singhal@psyh.christuniversity.in
Rtr. Athish Srinivas
Secretary
8867774894
athishsrinivas007@gmail.com
36
Rotaract Club of Dhanwantri Institutions
Institution Based
rotaractclubofdhanwantari@gmail.com
Bangalore Udyog
Rtr. Srujan Gowda
President
7483628594
srujangowda.h@gmail.com
Rtr. Falak
Secretary
9035619669
falak903561@gmail.com
Rtr. Keerthan Gowda T N
Joint Secretary
7204711503
keerthangowda1973@gmail.com
37
Rotaract Club of Falcon Youth
Community Based
rcfalconyouth@gmail.com
Bangalore Indiranagar
Rtr. Namratha Gopinath
President
8073965011
mailnamrathag@gmail.com
Rtr. Suzain Tanveer
Vice President
8431696646
Rtr. Dharini Jayakumar
Secretary- Administration
9606539666
Rtr. Vaishnavi B
Secretary- Operations
9632427804
38
Rotaract Club of GEMS B School
Institution Based
Racgemsbschool@gmail.com
Bangalore Junction
39
Rotaract Club of GITAM Bengaluru
Institution Based
rotaract.gitam.blr@gmail.com
Bengaluru Manyata
40
Rotaract Club of Gulmohar KIT MBA Department Tiptur
Institution Based
deepthiiamith@kittiptur.ac.in
Bangalore Gulmohar
41
Rotaract Club of H K Veeranna Gowda College
Institution Based
hkvrotaract@gmail.com
Maddur
42
Rotaract Club of HKBK Group of Institutions
Institution Based
hod_sss@hkbk.edu.in
Bangalore Skyway
Rtr. Vishal
President
8105924721
1hk23cs185@hkbk.edu.in
43
Rotaract Club of HKES Sree Veerendra Patil Degree College
Institution Based
hkesblore@gmail.com
Bangalore Nandini
44
Rotaract Club of Jyothy Institute of Technology
Institution Based
president.jit.rotaract@jyothyit.ac.in
Bangalore
Rtr. Inchara B S
President
9686623967
incharasiddaraju12@gmail.com
Rtr. Hitaishi G
Vice President
8792556359
hitaishii2005@gmail.com
Rtr. Aakarsh S Konanur
Secretary
8660693075
aakarshkonanur@gmail.com
Rtr. Sangeetha B S
Joint Secretary
6360105969
sangeethabs131@gmail.com
45
Rotaract Club of Koshys Institute of Management Studies Autonomous
Institution Based
csr@kgi.edu.in
Bangalore Downtowners
46
Rotaract Club of M S Ramaiah College of Arts, Science and Commerce
Institution Based
rotaract@msrcasc.edu.in
Bangalore North West
Rtr. Abhinandan Sharma
President
8431751919
abhinandansharma631@gmail.com
Rtr. Manish kumar S
Vice President
8073630510
manishkumar200664@gmail.com
Rtr. AG Ketan
Secretary- Administration
7619413334
guruketan@gmail.com
Rtr. Anwita Roy
Secretary- Operations
7980333254
royanwita3@gmail.com
47
Rotaract Club of M. S. Engineering College
Institution Based
racmsec@gmail.com
Bangalore Bhuvaneshwarinagar
Rtr. Nandini
President
7795964595
Rtr. Pujitha
Secretary
8050342999
48
Rotaract Club of Mandya
Community Based
rotaractmandya@gmail.com
Sakkare Naadu Mandya
Rtr. Geluvanth N Gowda
President
7676541805
geluvanth2007@gmail.com
49
Rotaract Club of MES College
Institution Based
mesrotaract3192@gmail.com
Bangalore North West
Rtr. Shamitha V Kulkarni
President
9113548837
shamithakulkarni22@gmail.com
Rtr. Saurabha P
Vice President
8951464885
Saurabhaprakash129@gmail.com
Rtr. Ananya T S
Secretary- Administration
9019737991
ananya06ts@gmail.com
Rtr. Namitha Bhat
Secretary- Operations
9164055888
namithabhat2007@gmail.com
50
Rotaract Club of MES Institute of Management
Institution Based
mesiomrotaract@gmail.com
Bangalore North
51
Rotaract club of MKPM RV Institute of Legal Studies
Institution Based
rotaractrvils.mkpm@gmail.com
Bangalore Brigades
Rtr. Shashank S Rayudu
President
9071009951
Shankshashank55@gmail.com
Rtr. Farheen Khanum
Secretary
9019462594
farheenkhanum721@gmail.com
52
Rotaract Club of MP Birla Institute of Management
Institution Based
rotaract@mpbim.com
E-Club of Bengaluru Sakhi
53
Rotaract Club of NBC College
Institution Based
northbglr24@gmail.com
Bangalore Downtowners
54
Rotaract Club of Nelamangala
Community Based
rotaractnelamangalatown@gmail.com
Nelamangala
Rtr. Sandeep N V
President
7204968112
ll.sandeep01.ll@gmail.com
Rtr. Bharath N C
Secretary
9741109484
bharathrc8@gmail.com
55
Rotaract Club of Presidency College
Institution Based
rcpc.presidency@gmail.com
Bangalore Raj Mahal Vilas
Rtr. Skanda
President
6363830557
getintouch.skanda@gmail.com
56
Rotaract Club of Presidency University Bangalore
Institution Based
rotaractcpu@gmail.com
Bangalore Oasis
Rtr. Deekshitha B
President
8884466773
deekshithababu11@gmail.com
Rtr. Affan
Vice President
7204426841
affankaisar12@gmail.com
Rtr. Soudhar Mendra V
Secretary- Operations
8778662605
soudhar2006@gmail.com
57
Rotaract Club of Rajanukunte Royals
Community Based
rotaractrajankunteroyals2025@gmail.com
Rotaract Bengaluru Nagasandra
Rtr. Pooja Y S
President
9663234716
rtr.poojays@gmail.com
Rtr. Poornachandra Tejaswi
Secretary
8296092263
poornachandra2424@gmail.com
58
Rotaract Club of RajaRajeswari College of Engineering
Institution Based
rrcerotaract@gmail.com
Bangalore
Rtr. Lahari G
President
8217037653
rtrlahari@gmail.com
Rtr. Parvathi Pratap H
Vice President
8296059659
parvathi.pratap.h@gmail.com
Rtr. Divya GR
Secretary- Administration
7483687157
divyaramesh36032@gmail.com
Rtr. Dhanalakshmi H S
Secretary- Operations
7760184742
dhanu0122333@gmail.com
59
Rotaract Club of Ramaiah Institute of Management Studies
Institution Based
rac.rimsclub@gmail.com
Bangalore Raj Mahal Vilas
Rtr. Varshini S V
President
9360215303
varshinisv06@gmail.com
Rtr. Venkata Sai Eshwar Cherla
Vice President
7673936126
eshwarcharla1@gmail.com
Rtr. Annam Shravan Kumar
Secretary
7093492281
shravankumar6982@gmail.com
60
Rotaract Club of RPA First Grade College Rajajinagar
Institution Based
rpafgcrotaractclub24@gmail.com
Bangalore West
61
Rotaract Club of RUAS
Institution Based
ruasrotaract2022@gmail.com
Bengaluru Manyata
Rtr. Harrshita Vibha R
President
9148595235
harrshita111@gmail.com
Rtr. Yashwanth Gowda M
Vice President
9148951094
ygowda484@gmail.com
Rtr. Md. Adil Attar
Secretary- Administration
7892497482
adilattarr06@gmail.com
Rtr. Joshna D
Secretary- Operations
7569299898
joshnadabbara26@gmail.com
Rtr. Divyanshi Ruhela
Joint Secretary - Administration
7017203180
divyanshiruhela28@gmail.com
Rtr. K Mercy Shyamala
Joint Secretary - Operations
8073843694
mercyshyamala1013@gmail.com
62
Rotaract Club of Sahakaranagar
Community Based
rotaractclubsahakaranagar@gmail.com
Bangalore Sahakaranagar
63
Rotaract Club of Sai Vidya Institute of Technology
Institution Based
rotaract_svit@saividya.ac.in
Bangalore Yelahanka
Rtr. Shwetha N
President
9448070134
rtr.shwetha@gmail.com
Rtr. Shrishant Shridhar Kashid
Vice President
8762401731
shrishantskashid@gmail.com
Rtr. Ullas N
Secretary
9902353509
ullasn3020@gmail.com
Rtr. Srushti S Patil
Joint Secretary
99028 84443
srushtispatil.23ec@saividya.ac.in
64
Rotaract Club of Seshadripuram College
Institution Based
rcscbengaluru@gmail.com
Bangalore Sadgamaya
65
Rotaract Club of Seshadripuram First Grade College Yelahanka
Institution Based
rotaractsims24@gmail.com
Bangalore Yelahanka
Rtr. Hari Haran R
President
8884050061
hariharan.ramesh.2412@gmail.com
Rtr. Akshay
Vice President
8590783359
akshaydivakaran113@gmail.com
Rtr. Mehdee
Secretary
9148925063
mehdeekhanmk2004@gmail.com
Rtr. Pratheeksha
Jt. Secretary
9902327181
pratheekshas1331@gmail.com
66
Rotaract Club of Siddaganga Institute of Technology Tumakuru
Institution Based
rotaractsit2@gmail.com
Tumakuru Central
67
Rotaract Club of Silicon City
Institution Based
rotaract@siliconcitycollege.ac.in, rotaractclubsiliconcollege@gmail.com
Bengaluru Manyata
Rtr. Vidya Gowda
President
9110439585
Rtr. Hima
Secretary
9731518025
68
Rotaract Club of Soundarya Institute of Management and Science
Institution Based
rotaractsoundaryainstitute@gmail.com
Bengaluru Chimney Hill
69
Rotaract Club of Sree Siddaganga First Grade College
Institution Based
ssfgc.nel@gmail.com
Nelamangala
70
Rotaract Club of Sri Basaveshwara First Grade College
Institution Based
shreebfgcfw562123@gmail.com
Nelamangala
71
Rotaract Club of Sri Guru Sai First Grade College
Institution Based
sgsdegreecollegerotract@gmail.com
Bengaluru Spectrum
72
Rotaract Club of Sri Sai College for Women
Institution Based
saicollege.rotaract@gmail.com
Bangalore Mahalakshmi Central
73
Rotaract Club of Srirangapatna
Community Based
srprotaractclub@gmail.com
Srirangapatna
74
Rotaract Club of St Pauls College
Institution Based
rotaract.blr@stpaulscollege.edu.in
Vidyaranyapura
75
Rotaract Club of St. Anne's First Grade College
Institution Based
rotaract@stannesfgcmillerroad.edu.in
Bangalore Kalyan
Rtr. Rabiya
President
9972601899
Rtr. Dharshini
Secretary
7892899532
rdharshini814@gmail.com
76
Rotaract Club of St. Annes Degree College for Women
Institution Based
annescollege@gmail.com
Bangalore Ulsoor
77
Rotaract Club of St.Claret College
Institution Based
rotaractclubofstclaretcollege@gmail.com
Bengaluru Jalahalli
78
Rotaract Club of Surana College
Institution Based
racsuranacollege3192@gmail.com
Bangalore Indiranagar
Rtr. Mehul Sharma S P
President
7994689712
mehulsharmasp@gmail.com
79
Rotaract Club of Surana College Peenya
Institution Based
rcsp3192@gmail.com
Bangalore Udyog
Rtr. Hetvi K
President
7019637980
Rtr. Gagan
Vice President
9901837242
Rtr. Shreyas
Secretary- Administration
9380144373
Rtr. Supritha
Secretary- Operations
9380890245
80
Rotaract Club of Swarna Bengaluru
Community Based
rota.rcbs@gmail.com
Bangalore
Rtr. Vigneshwaran Nagarajan
President
7708960034
rtrvigneshwarann@gmail.com
Rtr. Rashmitha K Shetty
Vice President
8792415718
rashmithashetty2003@gmail.com
Rtr. Ganesh Prabhu S
Secretary
7892539214
ganeshprabhu2003@gmail.com
Rtr. Prerana Ramesh
Secretary
7406215733
preranaramesh4@gmail.com
81
Rotaract Club of Triveni College
Institution Based
Rotaractticm@gmail.com
Bangalore Udyog
Rtr. Manoj Kumar
President
7019654274
manojmanojkumarcn4@gmail.com
82
Rotaract Club of United International Business School
Institution Based
rotary@uibsblr.com
Bangalore Downtowners
Rtr. Priscilla Hosanna
President
7619521710
priscillahosanna@gmail.com
Rtr. Chandrashekhar
Secretary
8296670811
83
Rotaract Club of VBR
Institution Based
rotaractclubofvbr2022@gmail.com
Rotaract Bangalore Golden Rock
Rtr. Muazzam
President
7975216560
84
Rotaract Club of Vidya Para Medical College
Institution Based
vipmsrotaract@gmail.com
Malavalli
85
Rotaract Club of Vidyaranyapura
Community Based
rotaract.vidyaranyapura@gmail.com
Vidyaranyapura
Rtr. Rtn. Rohan Godwin
President
7019631498
rohangodwin21@gmail.com
Rtr. Arun Srinivas
Vice President
9880052292
arunrachapura@gmail.com
Rtr. Aditya Ghontale
Secretary
7411407643
adityaghontale@gmail.com
Rtr Deepthika Ramesh
Joint Secretary
9148843656
deepthikaramesh2005@gmail.com
86
Rotaract Club of Yelahanka
Community Based
rotaract.yelahanka@gmail.com
Bangalore Yelahanka
Rtr. Ranjana Kulkarni
President
6360959788
president.rcy@gmail.com
Rtr. Shishir B Vasista
Secretary
8660538717
vasista.b.shishir@gmail.com
87
Rotaract Club of Yenepoya
Institution Based
rotaractclub.blr@yenepoya.edu.in
Bangalore Junction
Rtr. Albeena
President
9916799287
`;

// Parse raw data
const lines = rawData.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
const clubs = [];
let i = 0;
while (i < lines.length) {
  // Check for number
  if (/^\d+$/.test(lines[i])) {
    const club = {
      name: lines[i+1],
      type: lines[i+2],
      email: lines[i+3],
      partner: lines[i+4],
      leaders: []
    };
    i += 5;
    while (i < lines.length && !/^\d+$/.test(lines[i])) {
      // Leader parsing
      // Name, Designation, Phone, Email (email could be missing if next line is Name again)
      // Actually we just read 4 lines if it matches
      let leaderName = lines[i];
      let leaderDesignation = lines[i+1] || "";
      let leaderPhone = lines[i+2] || "";
      let leaderEmail = "";
      
      // email is optional, check if lines[i+3] has @ or not a number or not starting with Rtr
      if (i + 3 < lines.length && !/^\d+$/.test(lines[i+3]) && !lines[i+3].toLowerCase().includes('rtr')) {
         leaderEmail = lines[i+3];
         i += 4;
      } else {
         i += 3;
      }
      
      if (leaderName && leaderName.toLowerCase().includes('rtr')) {
        club.leaders.push({
          name: leaderName,
          designation: leaderDesignation,
          phone: leaderPhone,
          email: leaderEmail
        });
      } else {
        // Just in case it wasn't a leader but something else
        i -= (leaderEmail ? 4 : 3);
        i++;
      }
    }
    clubs.push(club);
  } else {
    i++;
  }
}

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected. Processing", clubs.length, "clubs");

    await client.query("DELETE FROM club_leaders_directory");

    for (const club of clubs) {
      // 1. Update clubs table
      const updateRes = await client.query(`
        UPDATE clubs SET 
          club_type = $1,
          club_email = $2,
          partner_rotary_club = $3
        WHERE name = $4
      `, [club.type, club.email, club.partner, club.name]);

      // 2. Insert leaders
      for (const leader of club.leaders) {
        await client.query(`
          INSERT INTO club_leaders_directory (club_name, club_type, club_email, partner_club, name, designation, phone, email)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          club.name, club.type, club.email, club.partner,
          leader.name, leader.designation, leader.phone, leader.email
        ]);
      }
    }
    
    console.log("Successfully imported master sheet.");

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
