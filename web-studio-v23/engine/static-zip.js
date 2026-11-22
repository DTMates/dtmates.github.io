const encoder=new TextEncoder();

function checksum(bytes){
  let crc=0xffffffff;
  for(const byte of bytes){
    crc^=byte;
    for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  return (crc^0xffffffff)>>>0;
}

export function archive(files){
  const local=[], directory=[];
  let offset=0, directorySize=0;
  for(const [name,content] of Object.entries(files)){
    const path=encoder.encode(name), bytes=content instanceof Uint8Array?content:encoder.encode(content), crc=checksum(bytes);
    const header=new Uint8Array(30), view=new DataView(header.buffer);
    view.setUint32(0,0x04034b50,true);view.setUint16(4,20,true);
    view.setUint32(14,crc,true);view.setUint32(18,bytes.length,true);
    view.setUint32(22,bytes.length,true);view.setUint16(26,path.length,true);
    const entry=new Uint8Array(46), record=new DataView(entry.buffer);
    record.setUint32(0,0x02014b50,true);record.setUint16(4,20,true);
    entry.set(header.subarray(4),6);
    record.setUint32(42,offset,true);
    local.push(header,path,bytes);directory.push(entry,path);
    offset+=header.length+path.length+bytes.length;
    directorySize+=entry.length+path.length;
  }
  const end=new Uint8Array(22), view=new DataView(end.buffer);
  view.setUint32(0,0x06054b50,true);
  view.setUint16(8,directory.length/2,true);view.setUint16(10,directory.length/2,true);
  view.setUint32(12,directorySize,true);view.setUint32(16,offset,true);
  return new Blob([...local,...directory,end],{type:'application/zip'});
}
