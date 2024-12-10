const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ensureNoExcessiveConsecutiveByes = (participants, byesNeeded = 0) => {
    // Shuffle participants
    let tempShuffledParticipants = shuffleArray([...participants]);

    //Starting from the end, interleave BYEs (nulls) until the desired number is reached
    // For example: [1, 2, 3, 4, 5] with 3 BYEs -> [1, 2, 3, null, 4, null, 5, null]
    let i = tempShuffledParticipants.length ;
    while (byesNeeded > 0) {
      tempShuffledParticipants.splice(i, 0, null);
      byesNeeded--;
      i -= 1;
    }

    console.log("Final participants list: ");
    for(let i = 0; i < tempShuffledParticipants.length; i+=2) {
        console.log(`${tempShuffledParticipants[i]} vs ${tempShuffledParticipants[i+1]}`);
    }
    return tempShuffledParticipants;
  }

const main = () => {
    const participants = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const byesNeeded = (32-participants.length);
    ensureNoExcessiveConsecutiveByes(participants, byesNeeded);
}



main();