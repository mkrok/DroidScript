var czas = new Date();
var godz0, min0, godz1, min1;
var year, month, day, hours, minutes, seconds;
top=0.01;
left=0.02;
loc = app.CreateLocator( "GPS" );
var plik="";
var aktywnosc="Rolki";
var started = false;
var SMSnumber = "+48502552895";
var alarmSMS = false;
sdCardPath = app.GetExternalFolder();
var btnPause;
var paused = false;
var polozenie = "";
var dystans=0;
var szer="";
var dlug="";

//Called when application is started.
function OnStart()
{
    poczatek = new Date();
    datString(poczatek);
    godz0 = poczatek.getHours();
    min0 = poczatek.getMinutes();
    plik =  app.GetExternalFolder()+"/GPS/"+year+month+day+"-"+hours+minutes+seconds+".gpx";
    laymenu = app.CreateLayout("Linear","Vertical,FillXY,Right");
    laymenu.SetVisibility("Hide");

    mnu2= app.CreateButton("[fa-ellipsis-v]", 0.01, -1, "FontAwesome");
    mnu2.SetTextSize(15);
    mnu2.SetMargins(0.91, 0.01, 0.01, 0);
    mnu2.SetOnTouch(mnu2_OnTouch);
    laymenu.AddChild(mnu2);

    menuList = app.CreateList("Ustawienie numeru SMS, Zakończenie programu", 0.7, 0.14);
    menuList.SetBackColor("#ff555555");
    menuList.SetTextColor("#ffffffff");
    menuList.SetTextSize(20);
    menuList.SetMargins(0, 0, 0, 0.02);
    menuList.SetOnTouch(menuList_OnTouch);
    laymenu.AddChild(menuList);
    
    app.EnableBackKey( false );
    app.SetOrientation( "Portrait" );
    
    lay = app.CreateLayout( "Linear", "Left,FillXY" );    
    lay.SetBackGradient( "#ff222222", "#ff555555");
   
    pasGorny = app.CreateLayout("Linear","Horizontal,FillX,Centered");
    pasGorny.SetMargins(0, 0.01, 0.01, 0.02);
    title = app.CreateText( "    GPS logger v. 1.73", "Left");
    title.SetTextSize( 26 );
    title.SetMargins(0, 0.01, 0.25, 0);

    mnu = app.CreateButton("[fa-ellipsis-v]", 0.01, -1, "FontAwesome");
    mnu.SetTextSize(15);
    mnu.SetOnTouch(mnu_OnTouch);
     
    pasGorny.AddChild( title);
    pasGorny.AddChild( mnu );

    lay.AddChild(pasGorny);
    
    info = app.CreateText("", -1, 0.2, "Multiline,Left,FillX");
    info.SetTextSize( 16 );
    info.SetTextColor( "#ffffcc00" );
    info.SetBackColor("#99000000");
    info.SetMargins(0.02, 0, 0.02, 0.01);
    info.SetPadding(0.03, 0, 0.03, 0);
    lay.AddChild( info );    
    
    loc.SetOnChange( loc_OnChange ); 
    loc.SetRate(0); //odczyt jak najczęściej
    loc.Start();
    
    dist = app.CreateText("Dystans:      ", -1, "Left,FillX");
    dist.SetTextSize(25);
    dist.SetTextColor("#ddffffff");
    dist.SetMargins(0.1, 0.03, 0.05, 0);
    lay.AddChild(dist);

    dura = app.CreateText("Czas:        ", -1, "Left,FillX");
    dura.SetTextSize(25);
    dura.SetTextColor("#ddffffff");
    dura.SetMargins(0.1, 0.01, 0.05, 0);
    lay.AddChild(dura);

    velo = app.CreateText("Prędkość:   ", -1, "Left,FillX");
    velo.SetTextSize(25);
    velo.SetTextColor("#ddffffff");
    velo.SetMargins(0.1, 0.01, 0.05, 0);
    lay.AddChild(velo);

    vsr = app.CreateText("Prędkość śr: ", -1, "Left,FillX");
    vsr.SetTextSize(25);
    vsr.SetTextColor("#ddffffff");
    vsr.SetMargins(0.1, 0.01, 0.05, 0.01);
    lay.AddChild(vsr);
    
    sms = app.CreateLayout("Linear", "Horizontal,Left,FillX");
    sms.SetBackColor("#ff666666");
    sms.SetMargins(0.02, 0.05, 0.02, 0.05);
    
    sms1 = app.CreateText("SMS: ");
    sms1.SetTextSize(25);
    sms1.SetTextColor("#ffffcc00");
    sms1.SetMargins(0.03, 0.01, 0, 0);
    sms.AddChild(sms1);
    
    setSMS = app.CreateTextEdit(SMSnumber,-1,0.1,"Number");
    setSMS.lastPos=0;
    setSMS.SetOnChange( setSMSOnChange );
    setSMS.SetTextSize(25);
    setSMS.SetBackColor("#ff666666");
    setSMS.SetTextColor("#ffffcc00");
    setSMS.SetMargins(0, 0.01, 0, 0);
    setSMS.SetCursorPos(12);
    sms.AddChild(setSMS);
    
    smsOK = app.CreateButton("OK");
    smsOK.SetTextSize(18);
    smsOK.SetBackColor("#ffffcc00");
    smsOK.SetTextColor("#ff005555");
    smsOK.SetMargins(0, 0.01, 0.02, 0);
    smsOK.SetOnTouch( smsOK_OnTouch );
    
    sms.AddChild(smsOK);
    
    lay.AddChild(sms);
    sms.SetVisibility("Hide");
    //lay.AddChild(lay2);

    btns = app.CreateLayout("Linear", "Horizontal,FillX,Bottom");
    btns.SetMargins(0.015, 0.03, 0.05, 0.01);

    btnPause = app.CreateButton("[fa-pause]", 0.28, 0.15, "FontAwesome");
    btnPause.SetOnTouch( btnPause_OnTouch );
    btnPause.SetTextSize(25);
    //btnPause.SetBackColor("#ff004455");
    btnPause.SetMargins(0.035, 0, 0.01, 0);
    btns.AddChild(btnPause);

    btnSms = app.CreateButton("[fa-envelope]", 0.28, 0.15, "FontAwesome");
    btnSms.SetOnTouch( btnSms_OnTouch );
    btnSms.SetTextSize(30);
    //btnSms.SetBackColor("#ff004455");
    btnSms.SetMargins(0.01, 0, 0.01, 0);
    btns.AddChild(btnSms);
   
    btnExit = app.CreateButton("[fa-times-circle]", 0.28, 0.15, "FontAwesome");
    btnExit.SetOnTouch( btnExit_OnTouch );
    btnExit.SetTextSize(30);
    //btnExit.SetBackColor("#ff993333");
    btnExit.SetMargins(0.01, 0, 0.01, 0);
    btns.AddChild(btnExit);
    
    lay.AddChild(btns);
    
    app.AddLayout( lay );
    app.AddLayout( laymenu );
    
    log = new Array();
    Wyswietl("start aplikacji...");
    Wyswietl("ustalanie pozycji...");
}


function loc_OnChange( data )
{
    czas = new Date();
    datString(czas);
    godz1 = czas.getHours();
    min1 = czas.getMinutes();
    mins = godz1*60+min1-godz0*60-min0;
    minuty = mins % 60;
    godziny = (mins - minuty) / 60;
    if(minuty<10) m="0"+minuty;

    if (!started) {
        Wyswietl("folder: "+app.GetExternalFolder()+"/GPS");
        Wyswietl("plik: "+year+month+day+"-"+hours+minutes+seconds+".gpx");
        Wyswietl("trwa zapis do pliku...");
        gpxHeader();
        szer=data.latitude;
        dlug=data.longitude;
        started = true;
    }
    
    msg = '      <trkpt lat="'+data.latitude+'" lon="'+
data.longitude+'">\n'+"      <ele>"+data.altitude
+"</ele>\n" +"      <spd>"+data.speed
+"</spd>\n"+"      <time>"+year+"-"+month+"-"+day
    +"T"+hours+":"+minutes+":"+seconds
+"Z</time>\n"+"      </trkpt>\n";

    app.WriteFile( plik, msg, "Append" );
    polozenie = data.latitude+","+data.longitude;
    dystans+= loc.GetDistanceTo( szer, dlug );
    szer=data.latitude;
    dlug=data.longitude;
    dist.SetText("Dystans:          "+ (dystans/1000).toFixed(2)+" km");
    dura.SetText("Czas:                "+godziny+":"+m);
   if (mins>0)
    vsr.SetText("Prędkość śr:    "+(dystans*0.06/mins).toFixed(2)+" km/h");
    velo.SetText("Prędkość:        "+(data.speed*3.6).toFixed(2)+" km/h");
}


function gpxHeader( )
{
naglowek="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
+"<gpx version=\"1.1\" creator=\"mKrok GPS logger\" "
+"xsi:schemaLocation=\"http://www.topopgrafix.com/GPX/1/1 " 
+"http://www.topografix.com/GPX/1/1/gpx.xsd " 
+"http://www.garmin.com/xmlschemas/GpxExtensions/v3 "
+"http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd " 
+"http://www.garmin.com/xmlschemas/TrackPointExtension/v1 "
+"http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd\" " 
+"xmlns=\"http://www.topografix.com/GPX/1/1\" "
+"xmlns:gpxtpx=\"http://www.garmin.com/xmlschemas/TrackPointExtension/v1\" " 
+"xmlns:gpxx=\"http://www.garmin.com/xmlschemas/GpxExtensions/v3\" "
+"xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n"
   
app.WriteFile( plik, naglowek, "Append" );
app.WriteFile( plik, "  <trk>\n"+"    <type>"+aktywnosc.toUpperCase()+"</type>\n"+"    <trkseg>\n", "Append");

}

function OnBack()
    {              
        //Create dialog window.
        dlgExit = app.CreateDialog( "Zakończyć program?" );
       
        //Create a layout for dialog.
        layDlg = app.CreateLayout( "Linear", "Horizontal,FillXY" );
        layDlg.SetPadding( 0.02, 0.02, 0.02, 0.02 );
        dlgExit.AddLayout( layDlg );
   
        var btnYes = app.CreateButton("[fa-check-circle] Tak", 0.3, -1, "FontAwesome");
        btnYes.SetTextSize( 24 );
        btnYes.SetOnTouch( btnYes_OnTouch );
        layDlg.AddChild( btnYes );
       
        var btnNo = app.CreateButton("[fa-times-circle] Nie", 0.3, -1, "FontAwesome");
        btnNo.SetOnTouch( btnNo_OnTouch );
        btnNo.SetTextSize( 24 );
        layDlg.AddChild( btnNo );
       
        //Show dialog.
        dlgExit.Show();
    }
   
    function btnYes_OnTouch()
    {
        if (started) app.WriteFile(plik, "    </trkseg>\n"+"  </trk>\n"+"</gpx>", "Append" );
        dlgExit.Dismiss();
        app.Exit();
    }
   
function btnNo_OnTouch()
{
    dlgExit.Dismiss();
}
    
function btnExit_OnTouch()
{
    OnBack();
}
   
function btnPause_OnTouch()
{
    if (!paused) {
        loc.Stop();
        Wyswietl( "zatrzymany GPS..." ); 
        Wyswietl(  (dystans/1000).toFixed(2)+" km");
        btnPause.SetText("[fa-play]", -1, 0.2, "FontAwesome,FillX");
        paused = true;
    } else {
        Wyswietl( "włączony GPS..." ); 
        Wyswietl("trwa zapis do pliku...");
        loc.Start(); 
        btnPause.SetText("[fa-pause]", -1, 0.2, "FontAwesome,FillX");
        paused = false;
    }
}

function btnSms_OnTouch()
{
    sms1.SetVisibility("Show");
    setSMS.SetVisibility("Show"); 
    Wyswietl("wysyłam SMS do "+SMSnumber);
    sms = app.CreateSMS();
    sms.SetOnStatus( sms_OnStatus );
    sms.SetOnMessage( sms_OnMessage );
    sms.Send( SMSnumber, polozenie );
}

function sms_OnStatus( status )
{
    if (status = "Message sent") status="wysłano SMS";
    //if (status = "SMS delivered") status="dostarczono SMS";
    Wyswietl( status );

    if (paused) Wyswietl("zatrzymany GPS")
    else Wyswietl("trwa zapis do pliku...");
}

function sms_OnMessage( number, msg )
{
    //Wyswietl("SMS od "+number + ": " + msg );
}

function datString(czas)
{
    year=(czas.getFullYear()).toString();

    if (czas.getMonth()+1<10) month="0"+(czas.getMonth()+1).toString()
    else month=(czas.getMonth()+1).toString();

    if (czas.getDate()<10) day="0"+(czas.getDate()).toString()
    else day=(czas.getDate()).toString();

    if (czas.getHours()<10) hours="0"+(czas.getHours()).toString()
    else hours=(czas.getHours()).toString();
    
    if (czas.getMinutes()<10) minutes="0"+(czas.getMinutes()).toString()
    else minutes=(czas.getMinutes()).toString();

    if (czas.getSeconds()<10) seconds="0"+(czas.getSeconds()).toString()
    else seconds=(czas.getSeconds()).toString();
}



function Wyswietl( message)
{
    if (info.GetLineTop( info.GetLineCount() ) >= 0.2 )
        log.shift();
    log.push(message + "\n");
    info.SetText( log.join("") );
}


function setSMSOnChange()
{
   var s1 = this.GetText();
   var s2 = s1.replace(/[^0-9\+]/g, "");
   if(s1 != s2)
   {
      this.SetText(s2);
      this.SetCursorPos(this.lastPos); 
   }else
   {
      this.lastPos = this.GetCursorPos();
   }
   
}

function smsOK_OnTouch()
{
    SMSnumber = setSMS.GetText();
    sms.SetVisibility("Hide");
}

function mnu_OnTouch()
{
    laymenu.Animate("SlideFromTop");
    //mnu.SetVisibility("Hide");
}

function mnu2_OnTouch()
{
    mnu.SetVisibility("Show");
    laymenu.Animate("SlideToTop");  
}

function menuList_OnTouch( name )
{
    if ( name == "Ustawienie numeru SMS" ) {
        laymenu.Animate("SlideToTop");
        mnu.SetVisibility("Show");
        sms.SetVisibility("Show");
    }
    if ( name == "Zakończenie programu" ) {
        laymenu.Animate("SlideToTop");
        mnu.SetVisibility("Show");
        OnBack();
    }
}

function GPScalc(coord)
{
stopnie = coord - coord % 10;
minuty = 60 * ( coord - stopnie );
sekundy = 3600 * (coord - stopnie - minuty/60);

}


