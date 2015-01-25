<?php
function randLetter()
{
    $int = rand(0,51);
    $a_z = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $rand_letter = $a_z[$int];
    return $rand_letter;
}
$secretCode = "rTr";
$string = "";
 
for($i = 0; $i < 7; $i++){
    $string = $string.randLetter();
}
$string = $string.$secretCode;
 
for($i = 0; $i < 10; $i++){
    $string = $string.randLetter();
}
 
echo "code=$string";
?>